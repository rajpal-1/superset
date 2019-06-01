from superset.db_engine_specs.base import BaseEngineSpec, LimitMethod


class PostgresBaseEngineSpec(BaseEngineSpec):
    """ Abstract class for Postgres 'like' databases """

    engine = ''

    time_grain_functions = {
        None: '{col}',
        'PT1S': "DATE_TRUNC('second', {col})",
        'PT1M': "DATE_TRUNC('minute', {col})",
        'PT1H': "DATE_TRUNC('hour', {col})",
        'P1D': "DATE_TRUNC('day', {col})",
        'P1W': "DATE_TRUNC('week', {col})",
        'P1M': "DATE_TRUNC('month', {col})",
        'P0.25Y': "DATE_TRUNC('quarter', {col})",
        'P1Y': "DATE_TRUNC('year', {col})",
    }

    @classmethod
    def fetch_data(cls, cursor, limit):
        if not cursor.description:
            return []
        if cls.limit_method == LimitMethod.FETCH_MANY:
            return cursor.fetchmany(limit)
        return cursor.fetchall()

    @classmethod
    def epoch_to_dttm(cls):
        return "(timestamp 'epoch' + {col} * interval '1 second')"

    @classmethod
    def convert_dttm(cls, target_type, dttm):
        return "'{}'".format(dttm.strftime('%Y-%m-%d %H:%M:%S'))


class PostgresEngineSpec(PostgresBaseEngineSpec):
    engine = 'postgresql'
    max_column_name_length = 63
    try_remove_schema_from_table_name = False

    @classmethod
    def get_table_names(cls, inspector, schema):
        """Need to consider foreign tables for PostgreSQL"""
        tables = inspector.get_table_names(schema)
        tables.extend(inspector.get_foreign_table_names(schema))
        return sorted(tables)
