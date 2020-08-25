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
"""Models for scheduled execution of jobs"""
import enum
from datetime import datetime
from typing import Any, List

import pandas as pd
from flask_appbuilder import Model
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import backref, relationship, RelationshipProperty

from superset import db, security_manager
from superset.sql_parse import ParsedQuery

metadata = Model.metadata  # pylint: disable=no-member


alert_owner = Table(
    "alert_owner",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("ab_user.id")),
    Column("alert_id", Integer, ForeignKey("alerts.id")),
)


class AlertObserverType(str, enum.Enum):
    sql = "sql"


class AlertValidatorType(str, enum.Enum):
    not_null = "Not Null"
    deviation = "Deviation"


class AlertValidationType(str, enum.Enum):
    numerical = "Numerical"


class DeviationValidatorType(str, enum.Enum):
    range = "Range"
    threshold = "Threshold"
    percent_difference = "Percent Difference"
    integer_difference = "Integer Difference"


class Alert(Model):

    """Schedules for emailing slices / dashboards"""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    label = Column(String(150), nullable=False)
    active = Column(Boolean, default=True, index=True)
    crontab = Column(String(50), nullable=False)

    alert_type = Column(String(50))
    owners = relationship(security_manager.user_model, secondary=alert_owner)
    recipients = Column(Text)
    slack_channel = Column(Text)

    log_retention = Column(Integer, default=90)
    grace_period = Column(Integer, default=60 * 60 * 24)

    slice_id = Column(Integer, ForeignKey("slices.id"))
    slice = relationship("Slice", backref="alerts", foreign_keys=[slice_id])

    dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    dashboard = relationship("Dashboard", backref="alert", foreign_keys=[dashboard_id])

    last_eval_dttm = Column(DateTime, default=datetime.utcnow)
    last_state = Column(String(10))

    def __str__(self) -> str:
        return f"<{self.id}:{self.label}>"


class AlertLog(Model):
    """Keeps track of alert-related operations"""

    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True)
    scheduled_dttm = Column(DateTime)
    dttm_start = Column(DateTime, default=datetime.utcnow)
    dttm_end = Column(DateTime, default=datetime.utcnow)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    alert = relationship("Alert", backref="logs", foreign_keys=[alert_id])
    state = Column(String(10))

    @property
    def duration(self) -> int:
        return (self.dttm_end - self.dttm_start).total_seconds()


class Observer(Model):

    __tablename__ = "alert_observers"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    observer_type = Column(Enum(AlertObserverType))
    validation_type = Column(Enum(AlertValidationType))

    @declared_attr
    def alert_id(self) -> int:
        return Column(Integer, ForeignKey("alerts.id"), nullable=False)

    @declared_attr
    def alert(self) -> RelationshipProperty:
        return relationship(
            "Alert",
            foreign_keys=[self.alert_id],
            backref=backref("alert_observers", cascade="all, delete-orphan"),
        )

    @declared_attr
    def database_id(self) -> int:
        return Column(Integer, ForeignKey("dbs.id"), nullable=False)

    @declared_attr
    def database(self) -> RelationshipProperty:
        return relationship(
            "Database",
            foreign_keys=[self.database_id],
            backref=backref("alert_observers", cascade="all, delete-orphan"),
        )

    __mapper_args__ = {
        "polymorphic_identity": "base_observer",
        "polymorphic_on": observer_type,
    }


class SQLObserver(Observer):

    __tablename__ = "alert_observers"

    sql = Column(Text, nullable=False)

    def query(self) -> None:
        parsed_query = ParsedQuery(self.sql)
        sql = parsed_query.stripped()
        df = self.database.get_df(sql)

        self.observations.append(  # pylint: disable=no-member
            Observation(dttm_ts=datetime.utcnow(), value=df.to_json())
        )

        db.session.commit()

    def get_observations(self, observation_num: int) -> List[Any]:
        return (
            db.session.query(Observation)
            .filter_by(observer_id=self.id)
            .order_by(Observation.dttm_ts.desc())
            .limit(observation_num)
        )

    __mapper_args__ = {"polymorphic_identity": AlertObserverType.sql}


class Observation(Model):  # pylint: disable=too-few-public-methods

    __tablename__ = "alert_observations"

    id = Column(Integer, primary_key=True)
    dttm_ts = Column(DateTime, default=datetime.utcnow)
    observer_id = Column(Integer, ForeignKey("alert_observers.id"), nullable=False)
    observer = relationship(
        "Observer",
        foreign_keys=[observer_id],
        backref=backref("observations", cascade="all, delete-orphan"),
    )
    value = Column(Text)


class Validator(Model):

    __tablename__ = "alert_validators"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    validator_type = Column(Enum(AlertValidatorType))
    validation_type = Column(Enum(AlertValidationType))

    @declared_attr
    def alert_id(self) -> int:
        return Column(Integer, ForeignKey("alerts.id"), nullable=False)

    @declared_attr
    def alert(self) -> RelationshipProperty:
        return relationship(
            "Alert",
            foreign_keys=[self.alert_id],
            backref=backref("alert_validators", cascade="all, delete-orphan"),
        )

    __mapper_args__ = {
        "polymorphic_identity": "base_observation",
        "polymorphic_on": validator_type,
    }


class NotNullValidator(Validator):

    __tablename__ = "alert_validators"

    @staticmethod
    def validate(values: List[str]) -> bool:
        if values:
            df = pd.read_json(values[0])
            if not df.empty:
                for row in df.to_records():
                    if any(row):
                        return True

        return False

    __mapper_args__ = {
        "polymorphic_identity": AlertValidatorType.not_null,
    }


class DeviationValidator(Validator):

    __tablename__ = "alert_validators"

    deviation_type = Column(Enum(DeviationValidatorType))
    deviation_difference = Column(Float)
    deviation_threshold = Column(Integer)
    range_min = Column(Integer)
    range_max = Column(Integer)

    def validate(self, values: List[str]) -> bool:
        # Creates a list of values from the first row and first column in a SQL result
        # Filters out empty results
        value_list = [
            pd.read_json(value).to_records()[0][1]
            for value in values
            if not pd.read_json(value).empty
        ]

        if len(values) == 0 or len(value_list) != len(values):
            return False

        if self.deviation_type == DeviationValidatorType.threshold:
            if value_list[0] >= self.deviation_threshold:
                return True

        elif self.deviation_type == DeviationValidatorType.range:
            if value_list[0] > self.range_max or value_list[0] < self.range_min:
                return True

        elif len(value_list) > 1:
            if self.deviation_type == DeviationValidatorType.integer_difference:
                difference = value_list[0] - value_list[1]
            elif self.deviation_type == DeviationValidatorType.percent_difference:
                if value_list[1] == 0.0:
                    difference = float("inf")
                else:
                    difference = float(value_list[0]) / value_list[1]
                    difference = round(difference - 1.0, 4)
            else:
                return False

            if (
                0.0 >= self.deviation_difference >= difference
                or 0.0 <= self.deviation_difference <= difference
            ):
                return True

        return False

    __mapper_args__ = {
        "polymorphic_identity": AlertValidatorType.deviation,
    }
