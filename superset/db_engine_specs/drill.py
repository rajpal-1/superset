from urllib import parse

from superset.db_engine_specs.base import BaseEngineSpec


class DrillEngineSpec(BaseEngineSpec):
    """Engine spec for Apache Drill"""
    engine = 'drill'

    time_grain_functions = {
        None: '{col}',
        'PT1S': "NEARESTDATE({col}, 'SECOND')",
        'PT1M': "NEARESTDATE({col}, 'MINUTE')",
        'PT15M': "NEARESTDATE({col}, 'QUARTER_HOUR')",
        'PT0.5H': "NEARESTDATE({col}, 'HALF_HOUR')",
        'PT1H': "NEARESTDATE({col}, 'HOUR')",
        'P1D': "NEARESTDATE({col}, 'DAY')",
        'P1W': "NEARESTDATE({col}, 'WEEK_SUNDAY')",
        'P1M': "NEARESTDATE({col}, 'MONTH')",
        'P0.25Y': "NEARESTDATE({col}, 'QUARTER')",
        'P1Y': "NEARESTDATE({col}, 'YEAR')",
    }

    # Returns a function to convert a Unix timestamp in milliseconds to a date
    @classmethod
    def epoch_to_dttm(cls):
        return cls.epoch_ms_to_dttm().replace('{col}', '({col}*1000)')

    @classmethod
    def epoch_ms_to_dttm(cls):
        return 'TO_DATE({col})'

    @classmethod
    def convert_dttm(cls, target_type, dttm):
        tt = target_type.upper()
        if tt == 'DATE':
            return "CAST('{}' AS DATE)".format(dttm.isoformat()[:10])
        elif tt == 'TIMESTAMP':
            return "CAST('{}' AS TIMESTAMP)".format(
                dttm.strftime('%Y-%m-%d %H:%M:%S'))
        return "'{}'".format(dttm.strftime('%Y-%m-%d %H:%M:%S'))

    @classmethod
    def adjust_database_uri(cls, uri, selected_schema):
        if selected_schema:
            uri.database = parse.quote(selected_schema, safe='')
        return uri
