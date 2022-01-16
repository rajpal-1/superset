#  Licensed to the Apache Software Foundation (ASF) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The ASF licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.
from __future__ import annotations

from typing import Callable, TYPE_CHECKING
from unittest.mock import Mock

from pytest import fixture

from tests.example_data.data_loading.pandas.pandas_data_loader import PandasDataLoader
from tests.example_data.data_loading.pandas.pands_data_loading_conf import (
    PandasLoaderConfigurations,
)
from tests.example_data.data_loading.pandas.table_df_convertor import (
    TableToDfConvertorImpl,
)

if TYPE_CHECKING:
    from sqlalchemy.engine import Engine

    from tests.example_data.data_loading.base_data_loader import DataLoader
    from tests.example_data.data_loading.pandas.pandas_data_loader import (
        TableToDfConvertor,
    )

pytest_plugins = "tests.fixtures"


@fixture(scope="session")
def example_db_engine_provider() -> Callable[[], Engine]:
    return lambda: Mock()


@fixture(scope="session")
def pandas_loader_configuration() -> PandasLoaderConfigurations:
    return PandasLoaderConfigurations.make_default()


@fixture(scope="session")
def table_to_df_convertor(
    pandas_loader_configuration: PandasLoaderConfigurations,
) -> TableToDfConvertor:
    return TableToDfConvertorImpl(True, pandas_loader_configuration.strftime)


@fixture(scope="session")
def data_loader(
    example_db_engine_provider: Callable[[], Engine],
    pandas_loader_configuration: PandasLoaderConfigurations,
    table_to_df_convertor: TableToDfConvertor,
) -> DataLoader:
    return PandasDataLoader(
        example_db_engine_provider(), pandas_loader_configuration, table_to_df_convertor
    )
