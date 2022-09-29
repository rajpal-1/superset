/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 import React from 'react';
 import { Link, useHistory } from 'react-router-dom';
 import { t, useTheme } from '@superset-ui/core';
 import { handleDashboardDelete, CardStyles } from 'src/views/CRUD/utils';
 import { isFeatureEnabled, FeatureFlag } from 'src/featureFlags';
 import { AntdDropdown } from 'src/components';
 import { Menu } from 'src/components/Menu';
 import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
 import ListViewCard from 'src/components/ListViewCard';
 import Icons from 'src/components/Icons';
 import Label from 'src/components/Label';
 import FacePile from 'src/components/FacePile';
 import FaveStar from 'src/components/FaveStar';
 import { Tag } from 'src/views/CRUD/types';
 
 interface TagCardProps {
   tag: Tag;
   hasPerm: (name: string) => boolean;
   bulkSelectEnabled: boolean;
   refreshData: () => void;
   loading: boolean;
   addDangerToast: (msg: string) => void;
   addSuccessToast: (msg: string) => void;
   openTagEditModal?: (t: Tag) => void;
   tagFilter?: string;
   userId?: string | number;
   showThumbnails?: boolean;
 }
 
 function TagCard({
   tag,
   hasPerm,
   bulkSelectEnabled,
   tagFilter,
   refreshData,
   userId,
   addDangerToast,
   addSuccessToast,
   openTagEditModal,
   showThumbnails,
 }: TagCardProps) {
   const history = useHistory();
   const canEdit = hasPerm('can_write');
   const canDelete = hasPerm('can_write');
   const canExport = hasPerm('can_export');
 
   const theme = useTheme();
   const menu = (
     <Menu>
       {canEdit && openTagEditModal && (
         <Menu.Item>
           <div
             role="button"
             tabIndex={0}
             className="action-button"
             onClick={() =>
               openTagEditModal && openTagEditModal(tag)
             }
             data-test="dashboard-card-option-edit-button"
           >
             <Icons.EditAlt iconSize="l" data-test="edit-alt" /> {t('Edit')}
           </div>
         </Menu.Item>
       )}
       {canDelete && (
         <Menu.Item>
           <ConfirmStatusChange
             title={t('Please confirm')}
             description={
               <>
                 {t('Are you sure you want to delete')}{' '}
                 <b>{tag.name}</b>?
               </>
             }
             onConfirm={() =>
               handleTagDelete(
                 tag,
                 refreshData,
                 addSuccessToast,
                 addDangerToast,
                 tagFilter,
                 userId,
               )
             }
           >
             {confirmDelete => (
               <div
                 role="button"
                 tabIndex={0}
                 className="action-button"
                 onClick={confirmDelete}
                 data-test="dashboard-card-option-delete-button"
               >
                 <Icons.Trash iconSize="l" /> {t('Delete')}
               </div>
             )}
           </ConfirmStatusChange>
         </Menu.Item>
       )}
     </Menu>
   );
   return (
     <CardStyles>
       <ListViewCard
         loading={tag.loading || false}
         title={tag.name}
         cover={
           !isFeatureEnabled(FeatureFlag.THUMBNAILS) || !showThumbnails ? (
             <></>
           ) : null
         }
         url={undefined}
         linkComponent={Link}
         imgFallbackURL="/static/assets/images/dashboard-card-fallback.svg"
         description={t('Modified %s', tag.changed_on)}
         actions={
           <ListViewCard.Actions
             onClick={e => {
               e.stopPropagation();
               e.preventDefault();
             }}
           >
             <AntdDropdown overlay={menu}>
               <Icons.MoreVert iconColor={theme.colors.grayscale.base} />
             </AntdDropdown>
           </ListViewCard.Actions>
         }
       />
     </CardStyles>
   );
 }
 
 export default TagCard;
 