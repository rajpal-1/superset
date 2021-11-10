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
from typing import Any, Dict, Optional
from unittest.mock import Mock, patch

from pytest import fixture, mark

from superset.common.query_factory import QueryContextFactory
from tests.common.query_context_generator import QueryContextGenerator


def create_app_config() -> Dict[str, Any]:
    return {
        "ROW_LIMIT": 5000,
        "DEFAULT_RELATIVE_START_TIME": "today",
        "DEFAULT_RELATIVE_END_TIME": "today",
        "SAMPLES_ROW_LIMIT": 1000,
        "SIP_15_ENABLED": True,
        "SQL_MAX_ROW": 100000,
    }


@fixture
def app_config() -> Dict[str, Any]:
    return create_app_config().copy()


@fixture
def session_factory() -> Mock:
    return Mock()


@fixture
def connector_registry() -> Mock:
    return Mock(spec=["get_datasource"])


def apply_max_row_limit(limit: int, max_limit: Optional[int] = None) -> int:
    if max_limit is None:
        max_limit = create_app_config()["SQL_MAX_ROW"]
    if limit != 0:
        return min(max_limit, limit)
    return max_limit


@fixture
def query_context_factory(
    app_config: Dict[str, Any], connector_registry: Mock, session_factory: Mock
) -> QueryContextFactory:
    import superset.common.query_object_factory as mod

    mod.apply_max_row_limit = apply_max_row_limit
    mod.get_time_range_endpoints = Mock()
    return QueryContextFactory(app_config, connector_registry, session_factory)


@fixture
def raw_query_context() -> Dict[str, Any]:
    return QueryContextGenerator().generate("birth_names")


@mark.ofek
class TestQueryFactory:
    def test_query_context_limit_and_offset_defaults(
        self,
        query_context_factory: QueryContextFactory,
        raw_query_context: Dict[str, Any],
    ):
        raw_query_context["queries"][0].pop("row_limit", None)
        raw_query_context["queries"][0].pop("row_offset", None)
        query_context = query_context_factory.create_from_dict(raw_query_context)
        query_object = query_context.queries[0]
        assert query_object.row_limit == 5000
        assert query_object.row_offset == 0

    def test_query_context_limit(
        self,
        query_context_factory: QueryContextFactory,
        raw_query_context: Dict[str, Any],
    ):
        raw_query_context["queries"][0]["row_limit"] = 100
        raw_query_context["queries"][0]["row_offset"] = 200
        query_context = query_context_factory.create_from_dict(raw_query_context)
        query_object = query_context.queries[0]

        assert query_object.row_limit == 100
        assert query_object.row_offset == 200

    def test_query_context_null_post_processing_op(
        self,
        query_context_factory: QueryContextFactory,
        raw_query_context: Dict[str, Any],
    ):
        raw_query_context["queries"][0]["post_processing"] = [None]
        query_context = query_context_factory.create_from_dict(raw_query_context)
        assert query_context.queries[0].post_processing == []
