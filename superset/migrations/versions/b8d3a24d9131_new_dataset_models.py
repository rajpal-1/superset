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

# pylint: disable=too-few-public-methods
"""New dataset models

Revision ID: b8d3a24d9131
Revises: 5afbb1a5849b
Create Date: 2021-11-11 16:41:53.266965

"""

import json
from typing import List
from uuid import uuid4

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship, Session
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.sql.expression import and_, desc, or_
from sqlalchemy_utils import UUIDType

from superset import app, db
from superset.connectors.sqla.models import ADDITIVE_METRIC_TYPES
from superset.extensions import encrypted_field_factory
from superset.sql_parse import ParsedQuery

# revision identifiers, used by Alembic.
revision = "b8d3a24d9131"
down_revision = "5afbb1a5849b"

Base = declarative_base()
custom_password_store = app.config["SQLALCHEMY_CUSTOM_PASSWORD_STORE"]
DB_CONNECTION_MUTATOR = app.config["DB_CONNECTION_MUTATOR"]


class Database(Base):

    __tablename__ = "dbs"
    __table_args__ = (UniqueConstraint("database_name"),)

    id = sa.Column(sa.Integer, primary_key=True)
    database_name = sa.Column(sa.String(250), unique=True, nullable=False)
    sqlalchemy_uri = sa.Column(sa.String(1024), nullable=False)
    password = sa.Column(encrypted_field_factory.create(sa.String(1024)))
    impersonate_user = sa.Column(sa.Boolean, default=False)
    encrypted_extra = sa.Column(encrypted_field_factory.create(sa.Text), nullable=True)
    extra = sa.Column(
        sa.Text,
        default=json.dumps(
            dict(
                metadata_params={},
                engine_params={},
                metadata_cache_timeout={},
                schemas_allowed_for_file_upload=[],
            )
        ),
    )
    server_cert = sa.Column(encrypted_field_factory.create(sa.Text), nullable=True)


class TableColumn(Base):

    __tablename__ = "table_columns"
    __table_args__ = (UniqueConstraint("table_id", "column_name"),)

    id = sa.Column(sa.Integer, primary_key=True)
    table_id = sa.Column(sa.Integer, sa.ForeignKey("tables.id"))
    is_active = sa.Column(sa.Boolean, default=True)
    extra = sa.Column(sa.Text)
    column_name = sa.Column(sa.String(255), nullable=False)
    type = sa.Column(sa.String(32))
    expression = sa.Column(sa.Text)
    description = sa.Column(sa.Text)
    is_dttm = sa.Column(sa.Boolean, default=False)
    filterable = sa.Column(sa.Boolean, default=True)
    groupby = sa.Column(sa.Boolean, default=True)
    verbose_name = sa.Column(sa.String(1024))
    python_date_format = sa.Column(sa.String(255))


class SqlMetric(Base):

    __tablename__ = "sql_metrics"
    __table_args__ = (UniqueConstraint("table_id", "metric_name"),)

    id = sa.Column(sa.Integer, primary_key=True)
    table_id = sa.Column(sa.Integer, sa.ForeignKey("tables.id"))
    extra = sa.Column(sa.Text)
    metric_type = sa.Column(sa.String(32))
    metric_name = sa.Column(sa.String(255), nullable=False)
    expression = sa.Column(sa.Text, nullable=False)
    warning_text = sa.Column(sa.Text)
    description = sa.Column(sa.Text)
    d3format = sa.Column(sa.String(128))
    verbose_name = sa.Column(sa.String(1024))


class SqlaTable(Base):

    __tablename__ = "tables"
    __table_args__ = (UniqueConstraint("database_id", "schema", "table_name"),)

    id = sa.Column(sa.Integer, primary_key=True)
    # Eager load related columns/metrics with `selectin`. Don't use `joined`
    # as it will bloat the memory very fast for large datasets.
    columns: List[TableColumn] = relationship(TableColumn, lazy="selectin")
    metrics: List[SqlMetric] = relationship(SqlMetric, lazy="selectin")
    column_class = TableColumn
    metric_class = SqlMetric

    database_id = sa.Column(sa.Integer, sa.ForeignKey("dbs.id"), nullable=False)
    database: Database = relationship(
        "Database",
        backref=backref("tables", cascade="all, delete-orphan"),
        foreign_keys=[database_id],
    )
    schema = sa.Column(sa.String(255))
    table_name = sa.Column(sa.String(250), nullable=False)
    sql = sa.Column(sa.Text)
    is_managed_externally = sa.Column(sa.Boolean, nullable=False, default=False)
    external_url = sa.Column(sa.Text, nullable=True)


table_column_association_table = sa.Table(
    "sl_table_columns",
    Base.metadata,
    sa.Column("table_id", sa.ForeignKey("sl_tables.id")),
    sa.Column("column_id", sa.ForeignKey("sl_columns.id")),
)

dataset_column_association_table = sa.Table(
    "sl_dataset_columns",
    Base.metadata,
    sa.Column("dataset_id", sa.ForeignKey("sl_datasets.id")),
    sa.Column("column_id", sa.ForeignKey("sl_columns.id")),
)

dataset_table_association_table = sa.Table(
    "sl_dataset_tables",
    Base.metadata,
    sa.Column("dataset_id", sa.ForeignKey("sl_datasets.id")),
    sa.Column("table_id", sa.ForeignKey("sl_tables.id")),
)


class NewColumn(Base):

    __tablename__ = "sl_columns"

    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.Text)
    type = sa.Column(sa.Text)
    expression = sa.Column(sa.Text)
    is_physical = sa.Column(sa.Boolean, default=True)
    description = sa.Column(sa.Text)
    warning_text = sa.Column(sa.Text)
    is_temporal = sa.Column(sa.Boolean, default=False)
    is_aggregation = sa.Column(sa.Boolean, default=False)
    is_additive = sa.Column(sa.Boolean, default=False)
    is_spatial = sa.Column(sa.Boolean, default=False)
    is_partition = sa.Column(sa.Boolean, default=False)
    is_increase_desired = sa.Column(sa.Boolean, default=True)
    is_managed_externally = sa.Column(sa.Boolean, nullable=False, default=False)
    external_url = sa.Column(sa.Text, nullable=True)
    extra_json = sa.Column(sa.Text, default="{}")


class NewTable(Base):

    __tablename__ = "sl_tables"
    __table_args__ = (UniqueConstraint("database_id", "catalog", "schema", "name"),)

    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.Text)
    schema = sa.Column(sa.Text)
    catalog = sa.Column(sa.Text)
    database_id = sa.Column(sa.Integer, sa.ForeignKey("dbs.id"), nullable=False)
    database: Database = relationship(
        "Database",
        backref=backref("new_tables", cascade="all, delete-orphan"),
        foreign_keys=[database_id],
    )
    columns: List[NewColumn] = relationship(
        "NewColumn", secondary=table_column_association_table, cascade="all, delete"
    )
    is_managed_externally = sa.Column(sa.Boolean, nullable=False, default=False)
    external_url = sa.Column(sa.Text, nullable=True)


class NewDataset(Base):

    __tablename__ = "sl_datasets"

    id = sa.Column(sa.Integer, primary_key=True)
    sqlatable_id = sa.Column(sa.Integer, nullable=True, unique=True)
    name = sa.Column(sa.Text)
    expression = sa.Column(sa.Text)
    tables: List[NewTable] = relationship(
        "NewTable", secondary=dataset_table_association_table
    )
    columns: List[NewColumn] = relationship(
        "NewColumn", secondary=dataset_column_association_table, cascade="all, delete"
    )
    is_physical = sa.Column(sa.Boolean, default=False)
    is_managed_externally = sa.Column(sa.Boolean, nullable=False, default=False)
    external_url = sa.Column(sa.Text, nullable=True)


def after_insert(target: SqlaTable) -> None:  # pylint: disable=too-many-locals
    """
    Copy old datasets to the new models.
    """
    session: Session = inspect(target).session
    database_id = target.database_id
    is_physical_table = not target.sql

    # get DB-specific conditional quoter for expressions that point to columns or
    # table names
    database = (
        target.database or session.query(Database).filter_by(id=database_id).first()
    )
    if not database:
        return
    url = make_url(database.sqlalchemy_uri)
    dialect_class = url.get_dialect()
    conditional_quote = dialect_class().identifier_preparer.quote

    # create columns
    columns = []
    for column in target.columns:
        # ``is_active`` might be ``None`` at this point, but it defaults to ``True``.
        if column.is_active is False:
            continue

        extra_json = json.loads(column.extra or "{}")
        for attr in {"groupby", "filterable", "verbose_name", "python_date_format"}:
            value = getattr(column, attr)
            if value:
                extra_json[attr] = value

        columns.append(
            NewColumn(
                name=column.column_name,
                description=column.description,
                external_url=target.external_url,
                expression=column.expression or conditional_quote(column.column_name),
                extra_json=json.dumps(extra_json) if extra_json else None,
                is_aggregation=False,
                is_increase_desired=True,
                is_managed_externally=target.is_managed_externally,
                is_temporal=column.is_dttm,
                is_spatial=False,
                is_partition=False,
                is_physical=(
                    is_physical_table
                    and (column.expression is None or column.expression == "")
                ),
                type=column.type or "Unknown",
            ),
        )

    # create metrics
    for metric in target.metrics:
        extra_json = json.loads(metric.extra or "{}")
        for attr in {"verbose_name", "metric_type", "d3format"}:
            value = getattr(metric, attr)
            if value:
                extra_json[attr] = value

        is_additive = (
            metric.metric_type and metric.metric_type.lower() in ADDITIVE_METRIC_TYPES
        )

        columns.append(
            NewColumn(
                name=metric.metric_name,
                description=metric.description,
                expression=metric.expression,
                external_url=target.external_url,
                extra_json=json.dumps(extra_json) if extra_json else None,
                is_aggregation=True,
                is_additive=is_additive,
                is_increase_desired=True,
                is_managed_externally=target.is_managed_externally,
                is_partition=False,
                is_physical=False,
                is_spatial=False,
                is_temporal=False,
                type="Unknown",  # figuring this out would require a type inferrer
                warning_text=metric.warning_text,
            ),
        )

    if is_physical_table:
        # create physical sl_table
        table = NewTable(
            name=target.table_name,
            schema=target.schema,
            catalog=None,  # currently not supported
            database_id=database_id,
            # only save physical columns
            columns=[column for column in columns if column.is_physical],
            is_managed_externally=target.is_managed_externally,
            external_url=target.external_url,
        )
        tables = [table]
        expression = conditional_quote(target.table_name)
    else:
        # find referenced tables and link to dataset
        parsed = ParsedQuery(target.sql)
        referenced_tables = parsed.tables
        predicate = or_(
            *[
                and_(
                    NewTable.database_id == database_id,
                    NewTable.schema == (table.schema or target.schema),
                    NewTable.name == table.table,
                )
                for table in referenced_tables
            ]
        )
        tables = session.query(NewTable).filter(predicate).all()
        expression = target.sql

    # create the new dataset
    dataset = NewDataset(
        sqlatable_id=target.id,
        name=target.table_name,
        expression=expression,
        tables=tables,
        columns=columns,
        is_physical=is_physical_table,
        is_managed_externally=target.is_managed_externally,
        external_url=target.external_url,
    )
    session.add(dataset)


new_tables = [
    (
        "sl_columns",
        # AuditMixinNullable
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        # ExtraJSONMixin
        sa.Column("extra_json", sa.Text(), nullable=True),
        # ImportExportMixin
        sa.Column(
            "uuid", UUIDType(binary=True), primary_key=False, default=uuid4, unique=True
        ),
        # Column
        sa.Column(
            "id", sa.INTEGER(), primary_key=True, autoincrement=True, nullable=False
        ),
        sa.Column("name", sa.TEXT(), nullable=False),
        sa.Column("type", sa.TEXT(), nullable=False),
        sa.Column("expression", sa.TEXT(), nullable=False),
        sa.Column("is_physical", sa.BOOLEAN(), nullable=False, default=True),
        sa.Column("description", sa.TEXT(), nullable=True),
        sa.Column("warning_text", sa.TEXT(), nullable=True),
        sa.Column("unit", sa.TEXT(), nullable=True),
        sa.Column("is_temporal", sa.BOOLEAN(), nullable=False),
        sa.Column("is_spatial", sa.BOOLEAN(), nullable=False, default=False),
        sa.Column("is_partition", sa.BOOLEAN(), nullable=False, default=False),
        sa.Column("is_aggregation", sa.BOOLEAN(), nullable=False, default=False),
        sa.Column("is_additive", sa.BOOLEAN(), nullable=False, default=False),
        sa.Column("is_increase_desired", sa.BOOLEAN(), nullable=False, default=True),
        sa.Column(
            "is_managed_externally",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("external_url", sa.Text(), nullable=True),
    ),
    (
        "sl_tables",
        # AuditMixinNullable
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        # ExtraJSONMixin
        sa.Column("extra_json", sa.Text(), nullable=True),
        # ImportExportMixin
        sa.Column(
            "uuid", UUIDType(binary=True), primary_key=False, default=uuid4, unique=True
        ),
        # Table
        sa.Column(
            "id", sa.INTEGER(), primary_key=True, autoincrement=True, nullable=False
        ),
        sa.Column(
            "database_id",
            sa.INTEGER(),
            sa.ForeignKey("dbs.id"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("catalog", sa.TEXT(), nullable=True),
        sa.Column("schema", sa.TEXT(), nullable=True),
        sa.Column("name", sa.TEXT(), nullable=False),
        sa.Column(
            "is_managed_externally",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("external_url", sa.Text(), nullable=True),
    ),
    (
        "sl_datasets",
        # AuditMixinNullable
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        # ExtraJSONMixin
        sa.Column("extra_json", sa.Text(), nullable=True),
        # ImportExportMixin
        sa.Column(
            "uuid", UUIDType(binary=True), primary_key=False, default=uuid4, unique=True
        ),
        # Dataset
        sa.Column(
            "id", sa.INTEGER(), primary_key=True, autoincrement=True, nullable=False
        ),
        sa.Column(
            "sqlatable_id",
            sa.INTEGER(),
            sa.ForeignKey("tables.id"),
            unique=True,
            nullable=True,
        ),
        sa.Column("name", sa.TEXT(), nullable=False),
        sa.Column("expression", sa.TEXT(), nullable=False),
        sa.Column("is_physical", sa.BOOLEAN(), nullable=False, default=False),
        sa.Column(
            "is_managed_externally",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("external_url", sa.Text(), nullable=True),
    ),
    # Relationships...
    (
        "sl_table_columns",
        sa.Column(
            "table_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_tables.id"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "column_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_columns.id"),
            autoincrement=False,
            nullable=False,
        ),
    ),
    (
        "sl_dataset_columns",
        sa.Column(
            "dataset_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_datasets.id"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "column_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_columns.id"),
            autoincrement=False,
            nullable=False,
        ),
    ),
    (
        "sl_dataset_tables",
        sa.Column(
            "dataset_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_datasets.id"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "table_id",
            sa.INTEGER(),
            sa.ForeignKey("sl_tables.id"),
            autoincrement=False,
            nullable=False,
        ),
    ),
]


def upgrade():
    # Create tables for the new models.
    for (table_name, *cols) in new_tables:
        op.create_table(table_name, *cols)

    # copy existing datasets to the new models
    session: Session = db.Session(bind=op.get_bind())
    total = session.query(SqlaTable.id).count()
    offset = 0
    limit = 20  # smaller page size is actually faster

    if total > 1000:
        print(f"Hang tight, we need to migrate {total} datasets today.")

    while offset < total:
        for i, dataset in enumerate(
            session.query(SqlaTable)
            .order_by(desc(SqlaTable.sql.is_(None)))
            .order_by(SqlaTable.id)
            .offset(offset)
            .limit(limit)
        ):
            table_name = dataset.table_name or ""
            short_table_name = table_name[:50]
            print(
                f"Copying #{offset + i + 1} [ID: {dataset.id}] "
                f"{short_table_name}{'...' if short_table_name != table_name else ''}"
                + " " * 50,  # extra space to override previous lines
                end="\r",
            )
            with op.get_context().autocommit_block():
                after_insert(target=dataset)
        offset += limit


def downgrade():
    op.drop_table("sl_dataset_columns")
    op.drop_table("sl_dataset_tables")
    op.drop_table("sl_datasets")
    op.drop_table("sl_table_columns")
    op.drop_table("sl_tables")
    op.drop_table("sl_columns")
