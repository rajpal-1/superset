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
"""chart-ds-constraint

Revision ID: 7e67aecbf3f1
Revises: b5ea9d343307
Create Date: 2023-03-27 12:30:01.164594

"""

# revision identifiers, used by Alembic.
revision = "7e67aecbf3f1"
down_revision = "b5ea9d343307"

import json

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.declarative import declarative_base

from superset import db

Base = declarative_base()


class Slice(Base):  # type: ignore
    __tablename__ = "slices"

    id = sa.Column(sa.Integer, primary_key=True)
    slice_name = sa.Column(sa.String(250))
    datasource_type = sa.Column(sa.String(200))
    query_context = sa.Column(sa.Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    for slc in session.query(Slice).filter(Slice.datasource_type != "table").all():
        # clean up all charts with datasource_type not != table
        slc.datasource_type = "table"

    op.create_check_constraint(
        "ck_chart_datasource", "slice", sa.column("datasource_type") == "table"
    )


def downgrade():
    op.drop_constraint("ck_chart_datasource", "slices", type_="check")
