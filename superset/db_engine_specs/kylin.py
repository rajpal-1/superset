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
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import types

from superset.db_engine_specs.base import BaseEngineSpec


class KylinEngineSpec(BaseEngineSpec):  # pylint: disable=abstract-method
    """Dialect for Apache Kylin"""

    engine = "kylin"
    engine_name = "Apache Kylin"

    _time_grain_expressions = {
        None: "{col}",
        "PT1S": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO SECOND) AS TIMESTAMP)",
        "PT1M": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO MINUTE) AS TIMESTAMP)",
        "PT1H": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO HOUR) AS TIMESTAMP)",
        "P1D": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO DAY) AS DATE)",
        "P1W": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO WEEK) AS DATE)",
        "P1M": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO MONTH) AS DATE)",
        "P3M": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO QUARTER) AS DATE)",
        "P1Y": "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO YEAR) AS DATE)",
    }

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        column_spec = cls.get_column_spec(target_type)
        sqla_type = column_spec.sqla_type if column_spec else None

        if isinstance(sqla_type, types.Date):
            return f"CAST('{dttm.date().isoformat()}' AS DATE)"
        if isinstance(sqla_type, types.TIMESTAMP):
            datetime_fomatted = dttm.isoformat(sep=" ", timespec="seconds")
            return f"""CAST('{datetime_fomatted}' AS TIMESTAMP)"""
        return None
