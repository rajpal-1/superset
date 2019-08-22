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
# noqa: T484
import abc
import logging
from logging.handlers import TimedRotatingFileHandler

import flask.app
import flask.config


class LoggingConfigurator(abc.ABC):
    @abc.abstractmethod
    def configure_logging(
        self, app_config: flask.config.Config, debug_mode: bool
    ) -> None:
        pass


class DefaultLoggingConfigurator(LoggingConfigurator):
    def configure_logging(
        self, app_config: flask.config.Config, debug_mode: bool
    ) -> None:
        if app_config.get("SILENCE_FAB"):
            logging.getLogger("flask_appbuilder").setLevel(logging.ERROR)

        # configure superset app logger
        superset_logger = logging.getLogger("superset")
        if debug_mode:
            superset_logger.setLevel(logging.DEBUG)
        else:
            # In production mode, add log handler to sys.stderr.
            superset_logger.addHandler(
                logging.StreamHandler()
            )  # pylint: disable=no-member
            superset_logger.setLevel(logging.INFO)  # pylint: disable=no-member

        logging.getLogger("pyhive.presto").setLevel(logging.INFO)  # noqa: T484

        logging.basicConfig(format=app_config.get("LOG_FORMAT"))  # noqa: T484
        logging.getLogger().setLevel(app_config.get("LOG_LEVEL"))  # noqa: T484

        if app_config.get("SILENCE_FAB"):
            logging.getLogger("flask_appbuilder").setLevel(logging.ERROR)  # noqa: T484

        if app_config.get("ENABLE_TIME_ROTATE"):
            logging.getLogger().setLevel(
                app_config.get("TIME_ROTATE_LOG_LEVEL")
            )  # noqa: T484
            handler = TimedRotatingFileHandler(  # noqa: T484
                app_config.get("FILENAME"),
                when=app_config.get("ROLLOVER"),
                interval=app_config.get("INTERVAL"),
                backupCount=app_config.get("BACKUP_COUNT"),
            )
            logging.getLogger().addHandler(handler)

        logging.info("logging was configured successfully")
