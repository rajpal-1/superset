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
from ariadne import (
    convert_kwargs_to_snake_case,
    graphql_sync,
    load_schema_from_path,
    make_executable_schema,
    ObjectType,
    snake_case_fallback_resolvers,
)
from ariadne.constants import PLAYGROUND_HTML
from flask import jsonify, request

from superset import app, db
from superset.models.core import Database
from superset.models.dashboard import Dashboard
from superset.typing import FlaskResponse


@convert_kwargs_to_snake_case
def resolve_database(obj, info, database_id):
    database = db.session.query(Database).filter_by(id=database_id).one()
    try:
        payload = {
            "success": True,
            "database": database.data,
        }
    except Exception as error:
        payload = {"success": False, "errors": [str(error)]}
    return payload


def resolve_dashboardInfo(obj, info, dashboard_id):
    dashboard = db.session.query(Dashboard).filter_by(id=dashboard_id).one()
    try:
        payload = {
            "success": True,
            "dashboard": dashboard.data,
        }

    except Exception as error:
        payload = {"success": False, "errors": [str(error)]}
    return payload


query = ObjectType("Query")

query.set_field("database", resolve_database)

query.set_field("dashboardInfo", resolve_dashboardInfo)

type_defs = load_schema_from_path("superset/views/schema.graphql")
schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)


@app.route("/graphql", methods=["GET"])
def graphql_playground():
    return PLAYGROUND_HTML, 200


@app.route("/graphql", methods=["POST"])
def graphql_server():
    data = request.get_json()

    success, result = graphql_sync(schema, data, context_value=request, debug=app.debug)

    status_code = 200 if success else 400
    return jsonify(result), status_code
