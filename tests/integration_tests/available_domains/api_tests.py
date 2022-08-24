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

import pytest

from tests.integration_tests.test_app import app


@pytest.mark.usefixtures("login_as_admin")
def test_get_available_domains(test_client):
    app.config["SUPERSET_WEBSERVER_DOMAINS"] = ["a", "b"]
    resp = test_client.get(f"api/v1/available_domains/")
    assert resp.status_code == 200
    data = json.loads(resp.data.decode("utf-8"))
    result = data.get("result")
    assert result == ["a", "b"]
