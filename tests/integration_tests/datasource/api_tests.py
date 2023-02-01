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
import json
from unittest.mock import Mock, patch

import pytest

from superset import db, security_manager
from superset.connectors.sqla.models import SqlaTable
from superset.dao.exceptions import DatasourceTypeNotSupportedError
from superset.datasource.commands.exceptions import GetTableFromDatabaseFailedError
from superset.utils.database import get_example_database
from tests.integration_tests.base_tests import SupersetTestCase


class TestDatasourceApi(SupersetTestCase):
    def get_virtual_dataset(self):
        return (
            db.session.query(SqlaTable)
            .filter(SqlaTable.table_name == "virtual_dataset")
            .one()
        )

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_ints(self):
        self.login(username="admin")
        table = self.get_virtual_dataset()
        rv = self.client.get(f"api/v1/datasource/table/{table.id}/column/col1/values/")
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        for val in range(10):
            assert val in response["result"]

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_strs(self):
        self.login(username="admin")
        table = self.get_virtual_dataset()
        rv = self.client.get(f"api/v1/datasource/table/{table.id}/column/col2/values/")
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        for val in ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]:
            assert val in response["result"]

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_floats(self):
        self.login(username="admin")
        table = self.get_virtual_dataset()
        rv = self.client.get(f"api/v1/datasource/table/{table.id}/column/col3/values/")
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        for val in [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]:
            assert val in response["result"]

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_nulls(self):
        self.login(username="admin")
        table = self.get_virtual_dataset()
        rv = self.client.get(f"api/v1/datasource/table/{table.id}/column/col4/values/")
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(response["result"], [None])

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_invalid_datasource_type(self):
        self.login(username="admin")
        table = self.get_virtual_dataset()
        rv = self.client.get(
            f"api/v1/datasource/not_table/{table.id}/column/col1/values/"
        )
        self.assertEqual(rv.status_code, 400)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(response["message"], "Invalid datasource type: not_table")

    @patch("superset.datasource.api.DatasourceDAO.get_datasource")
    def test_get_column_values_datasource_type_not_supported(self, get_datasource_mock):
        get_datasource_mock.side_effect = DatasourceTypeNotSupportedError
        self.login(username="admin")
        rv = self.client.get("api/v1/datasource/table/1/column/col1/values/")
        self.assertEqual(rv.status_code, 400)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(
            response["message"], "DAO datasource query source type is not supported"
        )

    def test_get_column_values_datasource_not_found(self):
        self.login(username="admin")
        rv = self.client.get("api/v1/datasource/table/999/column/col1/values/")
        self.assertEqual(rv.status_code, 404)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(response["message"], "Datasource does not exist")

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_column_values_no_datasource_access(self):
        # Allow gamma user to use this endpoint, but does not have datasource access
        perm = security_manager.find_permission_view_menu(
            "can_get_column_values", "Datasource"
        )
        gamma_role = security_manager.find_role("Gamma")
        security_manager.add_permission_role(gamma_role, perm)

        self.login(username="gamma")
        table = self.get_virtual_dataset()
        rv = self.client.get(f"api/v1/datasource/table/{table.id}/column/col1/values/")
        self.assertEqual(rv.status_code, 403)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(
            response["message"],
            "This endpoint requires the datasource virtual_dataset, "
            "database or `all_datasource_access` permission",
        )

    @patch("superset.datasource.api.DatasourceDAO.get_datasource")
    def test_get_column_values_not_implemented_error(self, get_datasource_mock):
        datasource = Mock()
        datasource.values_for_column.side_effect = NotImplementedError
        get_datasource_mock.return_value = datasource

        self.login(username="admin")
        rv = self.client.get("api/v1/datasource/sl_table/1/column/col1/values/")
        self.assertEqual(rv.status_code, 400)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(
            response["message"],
            "Unable to get column values for datasource type: sl_table",
        )

    @pytest.mark.usefixtures("app_context", "virtual_dataset")
    def test_get_or_create_table_already_exists(self):
        self.login(username="admin")
        rv = self.client.post(
            "api/v1/datasource/table/get_or_create/",
            json={
                "table_name": "virtual_dataset",
                "database_id": get_example_database().id,
            },
        )
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(
            response["result"], {"table_id": self.get_virtual_dataset().id}
        )

    def test_get_or_create_table_database_not_found(self):
        self.login(username="admin")
        rv = self.client.post(
            "api/v1/datasource/table/get_or_create/",
            json={"table_name": "virtual_dataset", "database_id": 999},
        )
        self.assertEqual(rv.status_code, 404)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(response["message"], "Database not found.")

    @patch("superset.datasource.commands.create_table.CreateSqlaTableCommand.run")
    def test_get_or_create_table_get_table_fails(self, run_command_mock):
        run_command_mock.side_effect = GetTableFromDatabaseFailedError
        self.login(username="admin")
        rv = self.client.post(
            "api/v1/datasource/table/get_or_create/",
            json={"table_name": "tbl", "database_id": get_example_database().id},
        )
        self.assertEqual(rv.status_code, 400)
        response = json.loads(rv.data.decode("utf-8"))
        self.assertEqual(
            response["message"],
            "Table could not be found, please check your "
            "database connection, schema, and table name",
        )

    def test_get_or_create_table_creates_table(self):
        self.login(username="admin")

        examples_db = get_example_database()
        with examples_db.get_sqla_engine_with_context() as engine:
            engine.execute("DROP TABLE IF EXISTS test_create_sqla_table_api")
            engine.execute("CREATE TABLE test_create_sqla_table_api AS SELECT 2 as col")

        rv = self.client.post(
            "api/v1/datasource/table/get_or_create/",
            json={
                "table_name": "test_create_sqla_table_api",
                "database_id": examples_db.id,
                "template_params": '{"param": 1}',
            },
        )
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data.decode("utf-8"))
        table = (
            db.session.query(SqlaTable)
            .filter_by(table_name="test_create_sqla_table_api")
            .one()
        )
        self.assertEqual(response["result"], {"table_id": table.id})
        self.assertEqual(table.template_params, '{"param": 1}')

        db.session.delete(table)
        with examples_db.get_sqla_engine_with_context() as engine:
            engine.execute("DROP TABLE test_create_sqla_table_api")
        db.session.commit()
