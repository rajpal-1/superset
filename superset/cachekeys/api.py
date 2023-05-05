# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import logging

from flask import request, Response
from flask_appbuilder import expose
from flask_appbuilder.api import safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import protect
from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from superset.cachekeys.commands.warm_up_cache import WarmUpCacheCommand
from superset.cachekeys.schemas import CacheInvalidationRequestSchema
from superset.commands.exceptions import CommandException
from superset.connectors.sqla.models import SqlaTable
from superset.extensions import cache_manager, db, event_logger, stats_logger_manager
from superset.models.cache import CacheKey
from superset.views.base_api import BaseSupersetModelRestApi, statsd_metrics

logger = logging.getLogger(__name__)


class CacheRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(CacheKey)
    resource_name = "cachekey"
    allow_browser_login = True
    class_permission_name = "CacheRestApi"
    include_route_methods = {
        "invalidate",
        "warm_up_cache",
    }

    openapi_spec_component_schemas = (CacheInvalidationRequestSchema,)

    @expose("/warm_up_cache", methods=["GET"])
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}"
        f".warm_up_cache",
        log_to_statsd=False,
    )
    def warm_up_cache(self) -> Response:
        """Warms up the cache for the slice or table.

        Note for slices a force refresh occurs.

        In terms of the `extra_filters` these can be obtained from records in the JSON
        encoded `logs.json` column associated with the `explore_json` action.

        ---
        get:
          description: >-
            Warms up the cache for the slice or table
          parameters:
          - in: query
            name: chart_id
            schema:
              type: integer
            description: The ID of the chart to warm up cache for
          - in: query
            name: dashboard_id
            schema:
              type: integer
            description: The ID of the dashboard to get filters for when warming cache
          - in: query
            name: table_name
            schema:
              type: string
            description: The name of the table to warm up cache for
          - in: query
            name: db_name
            schema:
              type: string
            description: The name of the database where the table is located
          - in: query
            name: extra_filters
            schema:
              type: string
            description: Extra filters to apply when warming up cache
          responses:
            200:
              description: Each chart's warmup status
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: array
                        items:
                          type: object
                          properties:
                            chart_id:
                              type: integer
                            viz_error:
                              type: string
                            viz_status:
                              type: string
            400:
              $ref: '#/components/responses/400'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        chart_id = request.args.get("chart_id")
        dashboard_id = request.args.get("dashboard_id")
        table_name = request.args.get("table_name")
        db_name = request.args.get("db_name")
        extra_filters = request.args.get("extra_filters")

        try:
            payload = WarmUpCacheCommand(
                chart_id, dashboard_id, table_name, db_name, extra_filters
            ).run()
            return self.response(200, result=payload)
        except CommandException as ex:
            return self.response(ex.status, message=ex.message)

    @expose("/invalidate", methods=["POST"])
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(log_to_statsd=False)
    def invalidate(self) -> Response:
        """
        Takes a list of datasources, finds the associated cache records and
        invalidates them and removes the database records

        ---
        post:
          description: >-
            Takes a list of datasources, finds the associated cache records and
            invalidates them and removes the database records
          requestBody:
            description: >-
              A list of datasources uuid or the tuples of database and datasource names
            required: true
            content:
              application/json:
                schema:
                  $ref: "#/components/schemas/CacheInvalidationRequestSchema"
          responses:
            201:
              description: cache was successfully invalidated
            400:
              $ref: '#/components/responses/400'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            datasources = CacheInvalidationRequestSchema().load(request.json)
        except KeyError:
            return self.response_400(message="Request is incorrect")
        except ValidationError as error:
            return self.response_400(message=str(error))
        datasource_uids = set(datasources.get("datasource_uids", []))
        for ds in datasources.get("datasources", []):
            ds_obj = SqlaTable.get_datasource_by_name(
                session=db.session,
                datasource_name=ds.get("datasource_name"),
                schema=ds.get("schema"),
                database_name=ds.get("database_name"),
            )

            if ds_obj:
                datasource_uids.add(ds_obj.uid)

        cache_key_objs = (
            db.session.query(CacheKey)
            .filter(CacheKey.datasource_uid.in_(datasource_uids))
            .all()
        )
        cache_keys = [c.cache_key for c in cache_key_objs]
        if cache_key_objs:
            all_keys_deleted = cache_manager.cache.delete_many(*cache_keys)

            if not all_keys_deleted:
                # expected behavior as keys may expire and cache is not a
                # persistent storage
                logger.info(
                    "Some of the cache keys were not deleted in the list %s", cache_keys
                )

            try:
                delete_stmt = (
                    CacheKey.__table__.delete().where(  # pylint: disable=no-member
                        CacheKey.cache_key.in_(cache_keys)
                    )
                )
                db.session.execute(delete_stmt)
                db.session.commit()
                stats_logger_manager.instance.gauge(
                    "invalidated_cache", len(cache_keys)
                )
                logger.info(
                    "Invalidated %s cache records for %s datasources",
                    len(cache_keys),
                    len(datasource_uids),
                )
            except SQLAlchemyError as ex:  # pragma: no cover
                logger.error(ex, exc_info=True)
                db.session.rollback()
                return self.response_500(str(ex))
            db.session.commit()
        return self.response(201)
