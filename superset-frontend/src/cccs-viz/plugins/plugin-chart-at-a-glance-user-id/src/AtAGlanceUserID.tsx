import React, { useState } from 'react';
import { RiGlobalFill } from 'react-icons/ri';
import { QueryFormData } from '@superset-ui/core';
import Collapse from 'src/components/Collapse';

type DataManager = {
  data: any[];
  isInit: boolean;
  isLoading: boolean;
  isError: boolean;
};

type AtAGlanceUserIDProps = QueryFormData & {
  ipDashboardId: string;
  ipDashboardFilterId: string;
  ipDashBoardBaseUrl: string; 
};

const generateClientIpLinksList = (ipList: any, ipDashBoardBaseUrl: string, ipDashboardId: string, ipDashboardFilterId: string) => {
  return(
    <ul>
      {ipList.map((a: { client_ip: string }) => (
        <li>
          <a
            href={
              `${ipDashBoardBaseUrl}/superset/dashboard/${ipDashboardId}/?native_filters=%28NATIVE_FILTER-${ipDashboardFilterId}%3A%28__cache%3A%28label%3A'${a.client_ip}'` +
              `%2CvalidateStatus%3A%21f%2Cvalue%3A%21%28'${a.client_ip}'%29%29%2CextraFormData%3A%28filters%3A%21%28%28col%3Aip_string%2Cop%3AIN%2Cval%3A%21%28'${a.client_ip}'` +
              `%29%29%29%29%2CfilterState%3A%28label%3A'${a.client_ip}'%2CvalidateStatus%3A%21f%2Cvalue%3A%21%28'${a.client_ip}'%29%29%2Cid%3ANATIVE_FILTER-${ipDashboardFilterId}` +
              `%2CownState%3A%28%29%29%29`}
          >
            {a.client_ip}
          </a>
        </li>
      ))}
    </ul>
  )
}


/**
 *   getPayloadField:
 *     description: Returns the value for a given field.
 *     parameters:
 *       - name: field
 *       - type: string
 *       - required: true
 *       - description: name of the field you want to get the value of
 *
 *       - name: payload
 *       - type: any
 *       - required: true
 *       - description: data object containing the response from the server.
 *     returns:
 *       value:
 *         description: Returns the value of the given field if found.
 */
const getPayloadField = (field: string, payload: any) => {
  let value = '';
  try {
    if (payload !== undefined) {
      value = payload[field];
      if (value === null) {
        value = 'Unknown';
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    value = 'Something went wrong';
  }
  return value;
};

// Main Component
function AtAGlanceUserIDCore(props: AtAGlanceUserIDProps) {

  const [userIDString, setUserIDString] = useState('user@domain.invalid,');
  
  let canadianIpsList: any[] = [];
  let nonCanadianIpsList: any[] = [];
  let unsuccessfulCanadianIpsList: any[] = [];
  let unsuccessfulNonCanadianIpsList: any[] = [];

  const [aadDataManager, setAadDataManger] = useState<DataManager>({
    data: props.data,
    isInit: false,
    isLoading: false,
    isError: false,
  });

  let hasFiltered = false;

  for (
    let i = 0;
    i < props.formData?.extraFormData?.filters?.length;
    // eslint-disable-next-line no-plusplus
    i++
  ) {
    const filter = props.formData.extraFormData.filters[i];
    if (filter.col === 'user_id') {
      const localUserId: string = filter.val[0];
      if (localUserId !== userIDString) {
        setAadDataManger({
          ...aadDataManager,
          data: props.data,
        });
        setUserIDString(localUserId);
        hasFiltered = false;
      }
      break;
    }
  }

  const COUNTRY_NAME_FIELD = 'client_ip_cbs_geo_country_name';
  const CANADA = 'canada';
  const OPERATION = 'operation';
  const USER_LOGGED_IN = 'UserLoggedIn';
  if (
    !aadDataManager.isLoading ||
    (aadDataManager.isInit && hasFiltered === false)
  ) {
    canadianIpsList = aadDataManager.data.filter(function (item) {
      return (
        getPayloadField(COUNTRY_NAME_FIELD, item) === CANADA &&
        getPayloadField(OPERATION, item) === USER_LOGGED_IN
      );
    });

    nonCanadianIpsList = aadDataManager.data.filter(function (item) {
      return (
        getPayloadField(COUNTRY_NAME_FIELD, item) !== CANADA &&
        getPayloadField(OPERATION, item) === USER_LOGGED_IN
      );
    });

    unsuccessfulCanadianIpsList = aadDataManager.data.filter(function (item) {
      return (
        getPayloadField(COUNTRY_NAME_FIELD, item) === CANADA &&
        getPayloadField(OPERATION, item) !== USER_LOGGED_IN
      );
    });

    unsuccessfulNonCanadianIpsList = aadDataManager.data.filter(function (
      item,
    ) {
      return (
        getPayloadField(COUNTRY_NAME_FIELD, item) !== CANADA &&
        getPayloadField(OPERATION, item) !== USER_LOGGED_IN
      );
    });

    hasFiltered = true;
  }

  return (
    <>
      <div>
        <RiGlobalFill />
        <span>At a Glance</span>
      </div>
      <div>
        <table>
          <tr>
            <td>User Email: {userIDString}</td>
          </tr>
          <tr>
            <td>
              User ID:{' '}
              {aadDataManager.isLoading
                ? 'Loading'
                : getPayloadField('user_key', aadDataManager.data[0])}
            </td>
          </tr>
        </table>
      </div>
      <div>
        <table>
          <tr>
            <Collapse bordered expandIconPosition="left" ghost>
              <Collapse.Panel
                header={
                  <span className="header">
                    {' '}
                    Number of Successful Canadian Login Attempts :{' '}
                    {aadDataManager.isLoading
                      ? 'Loading'
                      : canadianIpsList.length}{' '}
                  </span>
                }
                key="1"
              >
                {aadDataManager.isLoading && !aadDataManager.isInit ? (
                  <></>
                ) : (
                  generateClientIpLinksList(canadianIpsList, props.ipDashBoardBaseUrl, props.ipDashboardId, props.ipDashboardFilterId)
                )}
              </Collapse.Panel>
              <Collapse.Panel
                header={
                  <span className="header">
                    {' '}
                    Number of Successful non Canadian Login Attempts :{' '}
                    {aadDataManager.isLoading
                      ? 'Loading'
                      : nonCanadianIpsList.length}{' '}
                  </span>
                }
                key="2"
              >
                {aadDataManager.isLoading && !aadDataManager.isInit ? (
                  <></>
                ) : (
                  generateClientIpLinksList(nonCanadianIpsList, props.ipDashBoardBaseUrl, props.ipDashboardId, props.ipDashboardFilterId)
                )}
              </Collapse.Panel>
              <Collapse.Panel
                header={
                  <span className="header">
                    {' '}
                    Number of Unsuccessful Canadian Login Attempts :{' '}
                    {aadDataManager.isLoading
                      ? 'Loading'
                      : unsuccessfulCanadianIpsList.length}{' '}
                  </span>
                }
                key="3"
              >
                {aadDataManager.isLoading && !aadDataManager.isInit ? (
                  <></>
                ) : (
                  generateClientIpLinksList(unsuccessfulCanadianIpsList, props.ipDashBoardBaseUrl, props.ipDashboardId, props.ipDashboardFilterId)
                )}
              </Collapse.Panel>
              <Collapse.Panel
                header={
                  <span className="header">
                    {' '}
                    Number of Unsuccessful non Canadian Login Attempts :{' '}
                    {aadDataManager.isLoading
                      ? 'Loading'
                      : unsuccessfulNonCanadianIpsList.length}{' '}
                  </span>
                }
                key="4"
              >
                {aadDataManager.isLoading && !aadDataManager.isInit ? (
                  <></>
                ) : (
                  generateClientIpLinksList(unsuccessfulNonCanadianIpsList, props.ipDashBoardBaseUrl, props.ipDashboardId, props.ipDashboardFilterId)
                )}
              </Collapse.Panel>
            </Collapse>
          </tr>
        </table>
      </div>
    </>
  );
}

export default AtAGlanceUserIDCore;
