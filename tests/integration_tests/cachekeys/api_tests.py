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
# isort:skip_file
"""Unit tests for Superset"""
import json
from typing import Dict, Any
from urllib.parse import quote

import pytest

from superset.extensions import cache_manager, db
from superset.models.cache import CacheKey
from superset.utils.core import get_example_default_schema
from superset.utils.database import get_example_database
from tests.integration_tests.base_tests import (
    SupersetTestCase,
    post_assert_metric,
)
from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,
    load_birth_names_data,
)
from tests.integration_tests.fixtures.energy_dashboard import (
    load_energy_table_with_slice,
    load_energy_table_data,
)


@pytest.fixture
def invalidate(test_client, login_as_admin):
    def _invalidate(params: Dict[str, Any]):
        return post_assert_metric(
            test_client, "api/v1/cachekey/invalidate", params, "invalidate"
        )

    return _invalidate


def test_invalidate_cache(invalidate):
    rv = invalidate({"datasource_uids": ["3__table"]})
    assert rv.status_code == 201


def test_invalidate_existing_cache(invalidate):
    db.session.add(CacheKey(cache_key="cache_key", datasource_uid="3__table"))
    db.session.commit()
    cache_manager.cache.set("cache_key", "value")

    rv = invalidate({"datasource_uids": ["3__table"]})

    assert rv.status_code == 201
    assert cache_manager.cache.get("cache_key") == None
    assert (
        not db.session.query(CacheKey).filter(CacheKey.cache_key == "cache_key").first()
    )


def test_invalidate_cache_empty_input(invalidate):
    rv = invalidate({"datasource_uids": []})
    assert rv.status_code == 201

    rv = invalidate({"datasources": []})
    assert rv.status_code == 201

    rv = invalidate({"datasource_uids": [], "datasources": []})
    assert rv.status_code == 201


def test_invalidate_cache_bad_request(invalidate):
    rv = invalidate(
        {
            "datasource_uids": [],
            "datasources": [{"datasource_name": "", "datasource_type": None}],
        }
    )
    assert rv.status_code == 400

    rv = invalidate(
        {
            "datasource_uids": [],
            "datasources": [{"datasource_name": "", "datasource_type": "bla"}],
        }
    )
    assert rv.status_code == 400

    rv = invalidate(
        {
            "datasource_uids": "datasource",
            "datasources": [{"datasource_name": "", "datasource_type": "bla"}],
        }
    )
    assert rv.status_code == 400


def test_invalidate_existing_caches(invalidate):
    schema = get_example_default_schema() or ""
    bn = SupersetTestCase.get_birth_names_dataset()

    db.session.add(CacheKey(cache_key="cache_key1", datasource_uid="3__druid"))
    db.session.add(CacheKey(cache_key="cache_key2", datasource_uid="3__druid"))
    db.session.add(CacheKey(cache_key="cache_key4", datasource_uid=f"{bn.id}__table"))
    db.session.add(CacheKey(cache_key="cache_keyX", datasource_uid="X__table"))
    db.session.commit()

    cache_manager.cache.set("cache_key1", "value")
    cache_manager.cache.set("cache_key2", "value")
    cache_manager.cache.set("cache_key4", "value")
    cache_manager.cache.set("cache_keyX", "value")

    rv = invalidate(
        {
            "datasource_uids": ["3__druid", "4__druid"],
            "datasources": [
                {
                    "datasource_name": "birth_names",
                    "database_name": "examples",
                    "schema": schema,
                    "datasource_type": "table",
                },
                {  # table exists, no cache to invalidate
                    "datasource_name": "energy_usage",
                    "database_name": "examples",
                    "schema": schema,
                    "datasource_type": "table",
                },
                {  # table doesn't exist
                    "datasource_name": "does_not_exist",
                    "database_name": "examples",
                    "schema": schema,
                    "datasource_type": "table",
                },
                {  # database doesn't exist
                    "datasource_name": "birth_names",
                    "database_name": "does_not_exist",
                    "schema": schema,
                    "datasource_type": "table",
                },
                {  # database doesn't exist
                    "datasource_name": "birth_names",
                    "database_name": "examples",
                    "schema": "does_not_exist",
                    "datasource_type": "table",
                },
            ],
        }
    )

    assert rv.status_code == 201
    assert cache_manager.cache.get("cache_key1") is None
    assert cache_manager.cache.get("cache_key2") is None
    assert cache_manager.cache.get("cache_key4") is None
    assert cache_manager.cache.get("cache_keyX") == "value"
    assert (
        not db.session.query(CacheKey)
        .filter(CacheKey.cache_key.in_({"cache_key1", "cache_key2", "cache_key4"}))
        .first()
    )
    assert (
        db.session.query(CacheKey)
        .filter(CacheKey.cache_key == "cache_keyX")
        .first()
        .datasource_uid
        == "X__table"
    )


class TestWarmUpCache(SupersetTestCase):
    @pytest.mark.usefixtures(
        "load_energy_table_with_slice", "load_birth_names_dashboard_with_slices"
    )
    def test_warm_up_cache(self):
        self.login()
        slc = self.get_slice("Girls", db.session)
        data = self.get_json_resp(
            "/api/v1/cachekey/warm_up_cache?chart_id={}".format(slc.id)
        )
        self.assertEqual(
            data["result"],
            [{"chart_id": slc.id, "viz_error": None, "viz_status": "success"}],
        )

        data = self.get_json_resp(
            "/api/v1/cachekey/warm_up_cache?table_name=energy_usage"
            f"&db_name={get_example_database().database_name}"
        )
        assert len(data) > 0

        dashboard = self.get_dash_by_slug("births")

        assert self.get_json_resp(
            f"/api/v1/cachekey/warm_up_cache?dashboard_id={dashboard.id}&chart_id={slc.id}"
        )["result"] == [
            {"chart_id": slc.id, "viz_error": None, "viz_status": "success"}
        ]

        assert self.get_json_resp(
            f"/api/v1/cachekey/warm_up_cache?dashboard_id={dashboard.id}&chart_id={slc.id}&extra_filters="
            + quote(json.dumps([{"col": "name", "op": "in", "val": ["Jennifer"]}]))
        )["result"] == [
            {"chart_id": slc.id, "viz_error": None, "viz_status": "success"}
        ]
