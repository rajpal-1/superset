"""empty message

Revision ID: 3ba5164aa5dc
Revises: 626ad9f93c09
Create Date: 2018-11-30 08:34:25.372874

"""

# revision identifiers, used by Alembic.
revision = '3ba5164aa5dc'
down_revision = '626ad9f93c09'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('alert', sa.Column('execution', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('alert', 'execution')
    # ### end Alembic commands ###
