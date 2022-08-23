"""
API For Alfred REST requests
"""
import json
import logging
import os
from typing import Any

import requests
from flask.wrappers import Response
from flask_appbuilder.api import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_login import current_user
from requests.structures import CaseInsensitiveDict

from superset import security_manager
from superset.connectors.sqla.models import SqlaTable
from superset.extensions import event_logger
from superset.views.base_api import BaseSupersetModelRestApi

logger = logging.getLogger(__name__)


class ProxyRestAPI(BaseSupersetModelRestApi):
    """
    Contains the functions which will act as the proxy to the Alfred API,
    as well as the helper functions for dealing with caught exceptions
    """

    datamodel = SQLAInterface(SqlaTable)

    include_route_methods = {"get_userid", "get_ipstring"}
    resource_name = "proxy"

    openapi_spec_tag = "Proxy"

    def __init__(self):
        """
        This is the init function for the ProxyRestAPI class
        """
        super().__init__()

        self.ALFRED_SCOPE = os.environ.get("ALFRED_SCOPE")

        self.ALFRED_URL = os.environ.get("ALFRED_URL")

        if os.environ.get("FLASK_ENV") == "development":
            self.SSL_CERT = os.environ.get("REQUESTS_CA_BUNDLE_DEV")
        else:
            self.SSL_CERT = os.environ.get("REQUESTS_CA_BUNDLE")

    def attach_url(
        self, response_code: int, app_url: str, err: bool, payload
    ) -> Response:
        """
        This is a function that will attach the app URL with the response that is
        being sent to the front-end (this will allow us to avoid hard coded URL's in
        both the back-end and the front-end)

        :param response_code: Numerical value representing the response code to be sent
        :param app_url: String value representing the Alfred URL
        :param err: Boolean value representing if an error occurred
        :param payload: String value representing the message to be sent to the front-end
        :returns: A response that is sent to the front-end
        """
        prep_payload = {"data": payload, "url": app_url, "err": err}

        return self.response(response_code, payload=prep_payload)

    def error_obtaining_token(
        self, token_name: str, raised_exception: Exception
    ) -> Response:
        """
        This is a function that returns an http response based on a passed in application name
        and exception that was caught when trying to get an OBO token for an application

        :param token_name: String value representing which app we are linking to
        :param raised_exception: Exception value representing the error that occurred
        :returns: Response generated from passing values to the attach_url function
        """
        logger.error(
            "Error obtaining on-behalf-of %s token: %s", token_name, raised_exception
        )
        return self.attach_url(
            400,
            self.ALFRED_URL,
            True,
            f"Error obtaining on-behalf-of {token_name} token: {raised_exception}",
        )

    def error_obtaining_response(
        self, token_name: str, raised_exception: Exception
    ) -> Response:
        """
        This is a function that returns an http response based on a passed in application name
        and exception that was caught when trying to get a response from an application

        :param token_name: String value representing which app we are linking to
        :param raised_exception: Exception value representing the error that occurred 
        :returns: Response generated from passing values to the attach_url function
        """
        logger.error("Error obtaining %s response: %s", token_name, raised_exception)
        return self.attach_url(
            400,
            self.ALFRED_URL,
            True,
            f"Error obtaining {token_name} response: {raised_exception}",
        )

    def make_alfred_connection(self, url: str) -> Response:
        """
        This is a function that will be called by both the get_userid and get_ipstring functions
        in order to minimize code duplication

        :param url: String value representing the URL we will send an API call to
        :returns: Response generated from passing values to the attach_url function
        """
        if (self.ALFRED_SCOPE is None and self.ALFRED_URL is None):
            return self.error_obtaining_response("Alfred", "No Alfred Scope and No Alfred URL")
        if (self.ALFRED_SCOPE is None):
            return self.error_obtaining_response("Alfred", "No Alfred Scope")
        if (self.ALFRED_URL is None):
            return self.error_obtaining_response("Alfred", "No Alfred URL")

        try:
            alfred_token = security_manager.get_on_behalf_of_access_token_with_cache(current_user.username,
                                                                                    self.ALFRED_SCOPE,
                                                                                    'alfred',
                                                                                    cache_result=True)
            if not alfred_token:
                raise Exception("Unable to fetch Alfred token")
        except (requests.exceptions.HTTPError, Exception) as err:
            return self.error_obtaining_token("Alfred", err)
        else:
            headers = CaseInsensitiveDict()
            headers["Accept"] = "application/json"
            headers["Authorization"] = f"Bearer { alfred_token }"
            alfred_resp = ""

            try:
                alfred_resp = requests.get(url, headers=headers, verify=self.SSL_CERT)
            except requests.exceptions.ConnectionError as err:
                return self.error_obtaining_response("Alfred", err)

            refresh_resp_json = json.loads(
                alfred_resp.content.decode("utf8", "replace")
            )
            return self.attach_url(200, self.ALFRED_URL, False, refresh_resp_json)

    @expose("/alfred/user_id/<string:user_id>", methods=["GET"])
    @event_logger.log_this_with_context(
        action=lambda self, *args, **_kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,  # pylint: disable-arguments-renamed
    )
    def get_userid(self, user_id: str, **_kwargs: Any) -> Response:
        """
        This is a function which will obtain an Alfred OBO token based on the
        current logged in user, and will then send a request to Alfred to see
        if the passed in user_id is in any reports/incidents

        :param user_id: String value representing the user id(s) passed in from the front-end
        :param _kwargs: Array representing any other arguments passed to the function
        :returns: Response generated from passing values to the make_alfred_connection function
        """
        user_emails = user_id.split(",")
        user_email_string = ''

        if len(user_emails) > 0:
            user_email_string = user_emails[0]
            for index in range(1, len(user_emails)):
                user_email_string += "%22%2C%20%22" + user_emails[index]

        url = (
                self.ALFRED_URL
                + "/rest/search/cypher?expression=MATCH%20(email%3AEMAIL_ADDRESS)%20WHERE%20email.value%20IN%20%5B%22"
                + user_email_string
                + "%22%5D%20RETURN%20email.value%2C%20email.maliciousness%2C%20email.uri"
            )

        return self.make_alfred_connection(url)

    @expose("/alfred/ip_string/<string:ip_string>", methods=["GET"])
    @event_logger.log_this_with_context(
        action=lambda self, *args, **_kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,  # pylint: disable-arguments-renamed
    )
    def get_ipstring(self, ip_string: str, **_kwargs: Any) -> Response:
        """
        This is a function which will obtain an Alfred OBO token based on the
        current logged in user, and will then send a request to Alfred to see
        if the passed in ip_string is in any reports/incidents

        :param ip_string: String value representing the ip(s) passed in from the front-end
        :param _kwargs: Array representing any other arguments passed to the function
        :returns: Response generated from passing values to the make_alfred_connection function
        """
        user_ips = ip_string.split(",")
        user_ip_string = ''

        if len(user_ips) > 0:
            user_ip_string = user_ips[0]
            for index in range(1, len(user_ips)):
                user_ip_string += "%22%2C%20%22" + user_ips[index]
            
        url = (
            self.ALFRED_URL
            + "/rest/search/cypher?expression=MATCH%20(ip%3AIP_ADDRESS)%20WHERE%20ip.value%20IN%20%5B%22"
            + user_ip_string
            + "%22%5D%20RETURN%20ip.value%2C%20ip.maliciousness%2C%20ip.creation_date%2C%20ip.created_by%2C%20ip.uri%2C%20ip.report_uri"
        )

        return self.make_alfred_connection(url)
