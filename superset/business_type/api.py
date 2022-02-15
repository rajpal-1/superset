"""
API For Business Type REST requests
"""
from typing import Any

from flask.wrappers import Response
from flask_appbuilder.api import expose, rison
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_babel import lazy_gettext as _

from superset import app
from superset.business_type.business_type_response import BusinessTypeResponse
from superset.business_type.schemas import business_type_convert_schema
from superset.connectors.sqla.models import SqlaTable
from superset.extensions import event_logger
from superset.views.base_api import BaseSupersetModelRestApi

config = app.config
BUSINESS_TYPE_ADDONS = config["BUSINESS_TYPE_ADDONS"]


class BusinessTypeRestApi(BaseSupersetModelRestApi):
    """
    Business Type Rest API
    -Will return available business types when the /types endpoint is accessed
    -Will return a BusinessTypeResponse object when the /convert endpoint is accessed
    and is passed in valid arguments
    """

    datamodel = SQLAInterface(SqlaTable)

    include_route_methods = {"get", "get_types"}
    resource_name = "business_type"

    openapi_spec_tag = "Business Type"
    apispec_parameter_schemas = {
        "business_type_convert_schema": business_type_convert_schema,
    }

    @expose("/convert", methods=["GET"])
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,  # pylint: disable-arguments-renamed
    )
    @rison()
    def get(self, **kwargs: Any) -> Response:
        """Returns a BusinessTypeResponse object populated with the passed in args
        ---
        get:
          description: >-
            Returns a BusinessTypeResponse object populated with the passed in args.
          parameters:
          - in: query
            name: q
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/business_type_convert_schema'
          responses:
            200:
              description: a successful return of a BusinessTypeResponse object has taken place.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      status:
                        type: string
                      values:
                        type: array
                      formatted_value:
                        type: string
                      error_message:
                        type: string
                      valid_filter_operators:
                        type: string
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        items = kwargs["rison"]
        business_type = items.get("type")
        if not business_type:
            return self.response(400, message=_("Missing business type in request"))
        values = items["values"]
        if not values:
            return self.response(400, message=_("Missing values in request"))
        addon = BUSINESS_TYPE_ADDONS.get(business_type)
        if not addon:
            return self.response(
                400,
                message=_(
                    "Invalid business type: %(business_type)s",
                    business_type=business_type,
                ),
            )
        bus_resp: BusinessTypeResponse = addon.translate_type(
            {"values": values,}
        )
        return self.response(200, result=bus_resp)

    @expose("/types", methods=["GET"])
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,  # pylint: disable-arguments-renamed
    )
    def get_types(self, **kwargs: Any) -> Response:
        """Returns a list of available business types
        ---
        get:
          description: >-
            Returns a list of available business types.
          responses:
            200:
              description: a successful return of the available business types has taken place.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: array
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """

        return self.response(200, result=list(BUSINESS_TYPE_ADDONS.keys()))
