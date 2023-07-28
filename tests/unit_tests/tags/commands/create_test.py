import pytest
from sqlalchemy.orm.session import Session

from superset.utils.core import DatasourceType


@pytest.fixture
def session_with_data(session: Session):
    from superset.connectors.sqla.models import SqlaTable, TableColumn
    from superset.models.core import Database
    from superset.models.slice import Slice
    from superset.models.sql_lab import Query, SavedQuery

    engine = session.get_bind()
    SqlaTable.metadata.create_all(engine)  # pylint: disable=no-member

    slice_obj = Slice(
        id=1,
        datasource_id=1,
        datasource_type=DatasourceType.TABLE,
        datasource_name="tmp_perm_table",
        slice_name="slice_name",
    )

    db = Database(database_name="my_database", sqlalchemy_uri="postgresql://")

    columns = [
        TableColumn(column_name="a", type="INTEGER"),
    ]

    sqla_table = SqlaTable(
        table_name="my_sqla_table",
        columns=columns,
        metrics=[],
        database=db,
    )

    saved_query = SavedQuery(label="test_query", database=db, sql="select * from foo")

    session.add(slice_obj)
    session.add(db)
    session.add(saved_query)
    session.add(sqla_table)
    session.commit()
    yield session


def test_create_command_success(session_with_data: Session):
    from superset.connectors.sqla.models import SqlaTable
    from superset.daos.tag import TagDAO
    from superset.models.slice import Slice
    from superset.models.sql_lab import Query, SavedQuery
    from superset.tags.commands.create import CreateCustomTagWithRelationshipsCommand
    from superset.tags.models import ObjectTypes, TaggedObject

    # Define a list of objects to tag
    query = session_with_data.query(SavedQuery).first()
    chart = session_with_data.query(Slice).first()
    dataset = session_with_data.query(SqlaTable).first()

    objects_to_tag = [
        (ObjectTypes.query, query.id),
        (ObjectTypes.chart, chart.id),
        (ObjectTypes.dashboard, dataset.id),
    ]

    CreateCustomTagWithRelationshipsCommand(
        objects_to_tag=objects_to_tag, tag="test_tag"
    ).run()

    assert len(session_with_data.query(TaggedObject).all()) == len(objects_to_tag)
    for object_type, object_id in objects_to_tag:
        assert (
            session_with_data.query(TaggedObject)
            .filter(
                TaggedObject.object_type == object_type,
                TaggedObject.object_id == object_id,
            )
            .one_or_none()
            is not None
        )


def test_create_command_failed_validate(session_with_data: Session):
    from superset.connectors.sqla.models import SqlaTable
    from superset.daos.tag import TagDAO
    from superset.models.slice import Slice
    from superset.models.sql_lab import Query, SavedQuery
    from superset.tags.commands.create import CreateCustomTagWithRelationshipsCommand
    from superset.tags.commands.exceptions import TagInvalidError
    from superset.tags.models import ObjectTypes, TaggedObject

    query = session_with_data.query(SavedQuery).first()
    chart = session_with_data.query(Slice).first()
    dataset = session_with_data.query(SqlaTable).first()

    objects_to_tag = [
        (ObjectTypes.query, query.id),
        (ObjectTypes.chart, 0),
        (ObjectTypes.dashboard, dataset.id),
    ]

    with pytest.raises(TagInvalidError):
        CreateCustomTagWithRelationshipsCommand(
            objects_to_tag=objects_to_tag, tag="test_tag"
        ).run()
