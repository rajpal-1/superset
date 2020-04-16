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
from typing import Any, Union

from marshmallow import fields, Schema, ValidationError
from marshmallow.validate import Length

from superset.exceptions import SupersetException
from superset.utils import core as utils

get_delete_ids_schema = {"type": "array", "items": {"type": "integer"}}
thumbnail_query_schema = {
    "type": "object",
    "properties": {"force": {"type": "boolean"}},
}


def validate_json(value: Union[bytes, bytearray, str]) -> None:
    try:
        utils.validate_json(value)
    except SupersetException:
        raise ValidationError("JSON not valid")


class ChartPostSchema(Schema):
    slice_name = fields.String(required=True, validate=Length(1, 250))
    description = fields.String(allow_none=True)
    viz_type = fields.String(allow_none=True, validate=Length(0, 250))
    owners = fields.List(fields.Integer())
    params = fields.String(allow_none=True, validate=validate_json)
    cache_timeout = fields.Integer(allow_none=True)
    datasource_id = fields.Integer(required=True)
    datasource_type = fields.String(required=True)
    datasource_name = fields.String(allow_none=True)
    dashboards = fields.List(fields.Integer())


class ChartPutSchema(Schema):
    slice_name = fields.String(allow_none=True, validate=Length(0, 250))
    description = fields.String(allow_none=True)
    viz_type = fields.String(allow_none=True, validate=Length(0, 250))
    owners = fields.List(fields.Integer())
    params = fields.String(allow_none=True)
    cache_timeout = fields.Integer(allow_none=True)
    datasource_id = fields.Integer(allow_none=True)
    datasource_type = fields.String(allow_none=True)
    dashboards = fields.List(fields.Integer())


class ChartDataColumn(Schema):
    column_name = fields.String(
        description="The name of the target column", example="mycol",
    )
    type = fields.String(description="Type of target column", example="BIGINT",)


class ChartDataAdhocMetric(Schema):
    """
    Ad-hoc metrics are used to define metrics outside the datasource.
    """

    expressionType = fields.String(
        description="Simple or SQL metric",
        required=True,
        enum=["SIMPLE", "SQL"],
        example="SQL",
    )
    aggregate = fields.String(
        description="Aggregation operator. Only required for simple expression types.",
        required=False,
        enum=["AVG", "COUNT", "COUNT_DISTINCT", "MAX", "MIN", "SUM"],
    )
    column = fields.Nested(ChartDataColumn)
    sqlExpression = fields.String(
        description="The metric as defined by a SQL aggregate expression. "
        "Only required for SQL expression type.",
        required=False,
        example="SUM(weight * observations) / SUM(weight)",
    )
    label = fields.String(
        description="Label for the metric. Is automatically generated unless "
        "hasCustomLabel is true, in which case label must be defined.",
        required=False,
        example="Weighted observations",
    )
    hasCustomLabel = fields.Boolean(
        description="When false, the label will be automatically generated based on "
        "the aggregate expression. When true, a custom label has to be "
        "specified.",
        required=False,
        example=True,
    )
    optionName = fields.String(
        description="Unique identifier. Can be any string value, as long as all "
        "metrics have a unique identifier. If undefined, a random name "
        "will be generated.",
        required=False,
        example="metric_aec60732-fac0-4b17-b736-93f1a5c93e30",
    )


class ChartDataAggregateConfig(fields.Dict):
    def __init__(self) -> None:
        super().__init__(
            description="The keys are the name of the aggregate column to be created, "
            "and the values specify the details of how to apply the "
            "aggregation. If an operator requires additional options, "
            "these can be passed here to be unpacked in the operator call. The following "
            "numpy operators are supported: average, argmin, argmax, cumsum, cumprod, "
            "max, mean, median, nansum, nanmin, nanmax, nanmean, nanmedian, min, "
            "percentile, prod, product, std, sum, var. Any options required by the "
            "operator can be passed to the `options` object.\n\n"
            "In the example, a new column `first_quantile` is created based on values "
            "in the column `my_col` using the `percentile` operator with "
            "the `q=0.25` parameter.",
            example={
                "first_quantile": {
                    "operator": "percentile",
                    "column": "my_col",
                    "options": {"q": 0.25},
                }
            },
        )


class ChartDataPostProcessingOperationOptions(Schema):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)


class ChartDataPostProcessingAggregateOptions(ChartDataPostProcessingOperationOptions):
    """
    Aggregate operation config.
    """

    groupby = (
        fields.List(
            fields.String(
                allow_none=False, description="Columns by which to group by",
            ),
            minLength=1,
            required=True,
        ),
    )
    aggregates = ChartDataAggregateConfig()


class ChartDataPostProcessingRollingOptions(ChartDataPostProcessingOperationOptions):
    """
    Rolling operation config.
    """

    columns = (
        fields.Dict(
            description="columns on which to perform rolling, mapping source column to "
            "target column. For instance, `{'y': 'y'}` will replace the "
            "column `y` with the rolling value in `y`, while `{'y': 'y2'}` "
            "will add a column `y2` based on rolling values calculated "
            "from `y`, leaving the original column `y` unchanged.",
            example={"weekly_rolling_sales": "sales"},
        ),
    )
    rolling_type = fields.String(
        description="Type of rolling window. Any numpy function will work.",
        enum=[
            "average",
            "argmin",
            "argmax",
            "cumsum",
            "cumprod",
            "max",
            "mean",
            "median",
            "nansum",
            "nanmin",
            "nanmax",
            "nanmean",
            "nanmedian",
            "min",
            "percentile",
            "prod",
            "product",
            "std",
            "sum",
            "var",
        ],
        required=True,
        example="percentile",
    )
    window = fields.Integer(
        description="Size of the rolling window in days.", required=True, example=7,
    )
    rolling_type_options = fields.Dict(
        desctiption="Optional options to pass to rolling method. Needed for "
        "e.g. quantile operation.",
        required=False,
        example={},
    )
    center = fields.Boolean(
        description="Should the label be at the center of the window. Default: `false`",
        required=False,
        example=False,
    )
    win_type = fields.String(
        description="Type of window function. See "
        "[SciPy window functions](https://docs.scipy.org/doc/scipy/reference/signal.windows.html#module-scipy.signal.windows) "
        "for more details. Some window functions require passing "
        "additional parameters to `rolling_type_options`. For instance, "
        "to use `gaussian`, the parameter `std` needs to be provided.",
        required=False,
        enum=[
            "boxcar",
            "triang",
            "blackman",
            "hamming",
            "bartlett",
            "parzen",
            "bohman",
            "blackmanharris",
            "nuttall",
            "barthann",
            "kaiser",
            "gaussian",
            "general_gaussian",
            "slepian",
            "exponential",
        ],
    )
    min_periods = fields.Integer(
        description="The minimum amount of periods required for a row to be included "
        "in the result set.",
        required=False,
        example=7,
    )


class ChartDataPostProcessingSelectOptions(ChartDataPostProcessingOperationOptions):
    """
    Sort operation config.
    """

    columns = fields.List(
        fields.String(),
        description="Columns which to select from the input data, in the desired "
        "order. If columns are renamed, the old column name should be "
        "referenced here.",
        example=["country", "gender", "age"],
    )
    rename = fields.List(
        fields.Dict(),
        description="columns which to rename, mapping source column to target column. "
        "For instance, `{'y': 'y2'}` will rename the column `y` to `y2`.",
        example=[{"age": "average_age"}],
    )


class ChartDataPostProcessingSortOptions(ChartDataPostProcessingOperationOptions):
    """
    Sort operation config.
    """

    columns = fields.Dict(
        description="columns by by which to sort. The key specifies the column name, "
        "value specifies if sorting in ascending order.",
        example={"country": True, "gender": False},
        required=True,
    )
    aggregates = ChartDataAggregateConfig()


class ChartDataPostProcessingPivotOptions(ChartDataPostProcessingOperationOptions):
    """
    Pivot operation config.
    """

    index = (
        fields.List(
            fields.String(
                allow_none=False,
                description="Columns to group by on the table index (=rows)",
            ),
            minLength=1,
            required=True,
        ),
    )
    columns = fields.List(
        fields.String(
            allow_none=False, description="Columns to group by on the table columns",
        ),
        minLength=1,
        required=True,
    )
    metric_fill_value = fields.Number(
        required=False,
        description="Value to replace missing values with in aggregate calculations.",
    )
    column_fill_value = fields.String(
        required=False, description="Value to replace missing pivot columns names with."
    )
    drop_missing_columns = fields.Boolean(
        description="Do not include columns whose entries are all missing "
        "(default: `true`).",
        required=False,
    )
    marginal_distributions = fields.Boolean(
        description="Add totals for row/column. (default: `false`)", required=False,
    )
    marginal_distribution_name = fields.String(
        description="Name of marginal distribution row/column. (default: `All`)",
        required=False,
    )
    aggregates = ChartDataAggregateConfig()


class ChartDataPostProcessingOperation(Schema):
    operation = fields.String(
        description="Post processing operation type",
        required=True,
        enum=["aggregate", "pivot", "rolling", "select", "sort"],
        example="aggregate",
    )
    options = fields.Nested(
        ChartDataPostProcessingOperationOptions(),
        description="Options specifying how to perform the operation. Please refer "
        "to the respective post processing operation option schemas. "
        "For example, `ChartDataPostProcessingOperationOptions` specifies "
        "the required options for the pivot operation.",
        example={
            "groupby": ["country", "gender"],
            "aggregates": {
                "age_q1": {
                    "operator": "percentile",
                    "column": "age",
                    "options": {"q": 0.25},
                },
                "age_mean": {"operator": "mean", "column": "age",},
            },
        },
    )


class ChartDataQueryObjectFilter(Schema):
    col = fields.String(
        description="The column to filter.", required=True, example="country"
    )
    op = fields.String(
        description="The comparison operator.",
        enum=[filter_op.value for filter_op in utils.FilterOperationType],
        required=True,
        example="IN",
    )
    val = fields.Raw(
        description="The value or values to compare against. Can be a string, "
        "integer, decimal or list, depending on the operator.",
        example=["China", "France", "Japan"],
    )


class ChartDataQueryObjectExtras(Schema):
    time_range_endpoints = fields.List(
        fields.String(enum=["INCLUSIVE", "EXCLUSIVE"]),
        description="A list with two values, stating if start/end should be "
        "inclusive/exclusive.",
        required=False,
    )
    relative_start = fields.String(
        description="Start time for relative time deltas. "
        'Default: `config["DEFAULT_RELATIVE_START_TIME"]`',
        enum=["today", "now"],
        required=False,
    )
    relative_end = fields.String(
        description="End time for relative time deltas. "
        'Default: `config["DEFAULT_RELATIVE_START_TIME"]`',
        enum=["today", "now"],
        required=False,
    )


class ChartDataQueryObject(Schema):
    filters = fields.Nested(ChartDataQueryObjectFilter())
    granularity = fields.String(
        description="To what level of granularity should the temporal column be "
        "aggregated. Supports "
        "[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) "
        "durations.",
        enum=[
            "PT1S",
            "PT1M",
            "PT5M",
            "PT10M",
            "PT15M",
            "PT0.5H",
            "PT1H",
            "P1D",
            "P1W",
            "P1M",
            "P0.25Y",
            "P1Y",
        ],
        required=False,
        example="P1D",
        groupby=fields.List(
            fields.String(description="Columns by which to group the query.",),
        ),
    )
    metrics = fields.List(
        # TODO: add string type when support for `anyOf` is added to Marshmallow.
        #  strings are used to reference matrics stored in the datasource.
        fields.Nested(ChartDataAdhocMetric),
        description="Aggregate expressions. Metrics can be passed as both "
        "references to datasource metrics (strings), or ad-hoc metrics"
        "which are defined only within the query object.",
    )
    post_processing = fields.List(
        fields.Nested(ChartDataPostProcessingOperation),
        description="Post processing operations to be applied to the result set. "
        "Operations are applied to the result set in sequential order.",
    )
    time_range = fields.String(
        description="A time rage, either expressed as a colon separated string "
        "`since : until`. Valid formats for `since` and `until` are: \n"
        "- ISO 8601\n"
        "- X days/years/hours/day/year/weeks\n"
        "- X days/years/hours/day/year/weeks ago\n"
        "- X days/years/hours/day/year/weeks from now\n"
        "\n"
        "Additionally, the following freeform can be used:\n"
        "\n"
        "- Last day\n"
        "- Last week\n"
        "- Last month\n"
        "- Last quarter\n"
        "- Last year\n"
        "- No filter\n"
        "- Last X seconds/minutes/hours/days/weeks/months/years\n"
        "- Next X seconds/minutes/hours/days/weeks/months/years\n",
        required=False,
        example="Last week",
    )
    time_shift = fields.String(
        description="A human-readable date/time string. "
        "Please refer to [parsdatetime](https://github.com/bear/parsedatetime) "
        "documentation for details on valid values.",
        required=False,
    )
    is_timeseries = fields.Boolean(
        description="Is the `query_object` a timeseries.", required=False
    )
    timeseries_limit = fields.Integer(
        description="Maximum row count for timeseries queries. Default: `0`",
        required=False,
    )
    row_limit = fields.Integer(
        description='Maximum row count. Default: `config["ROW_LIMIT"]`', required=False,
    )
    order_desc = fields.Boolean(
        description="Reverse order. Default: `false`", required=False
    )
    extras = fields.Dict(description=" Default: `{}`", required=False)
    columns = fields.List(fields.String(), description="", required=False,)
    orderby = fields.List(
        fields.List(fields.Raw()),
        description="Expects a list of lists where the first element is the column "
        "name which to sort by, and the second element is a boolean ",
        required=False,
        example=[["my_col_1", False], ["my_col_2", True]],
    )


class ChartDataDatasource(Schema):
    description = "Chart datasource"
    id = fields.Integer(description="Datasource id", required=True,)
    type = fields.String(description="Datasource type", enum=["druid", "sql"])


class ChartDataQueryContext(Schema):
    datasource = fields.Nested(ChartDataDatasource)
    queries = fields.List(fields.Nested(ChartDataQueryObject))


CHART_DATA_SCHEMAS = (
    ChartDataQueryContext,
    # TODO: These should optimally be included in the QueryContext schema as an `anyOf`
    #  in ChartDataPostPricessingOperation.options, but since `anyOf` is not yet
    #  supported by Marshmallow/apispec, this is not currently possible.
    ChartDataPostProcessingAggregateOptions,
    ChartDataPostProcessingPivotOptions,
    ChartDataPostProcessingRollingOptions,
    ChartDataPostProcessingSelectOptions,
    ChartDataPostProcessingSortOptions,
)
