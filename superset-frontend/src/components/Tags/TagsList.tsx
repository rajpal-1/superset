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

import React, { useMemo, useState } from 'react';
import { styled, SupersetTheme, t } from '@superset-ui/core';
import Tag from './Tag';
import TagType from 'src/types/TagType';
import Icons from '../Icons';

export type TagsListProps = {
  tags: TagType[];
  editable?: boolean;
  onDelete: (index: number) => void;
  maxTags: number | null;
};

const TagsDiv = styled.div`
  max-width: 100%;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  -webkit-flex-wrap: wrap;
`;

const TagsList = ({ 
  tags, 
  editable=false, 
  onDelete=(index) => null, 
  maxTags=null
}: TagsListProps) => {

  const handleDelete = (index: number) => {
    onDelete(index);
  }

  const tagsIsLong: boolean | null = useMemo(() => (maxTags ? (tags.length > maxTags): null), [tags.length, maxTags]);

  const extraTags: number | null = useMemo(() => ((typeof maxTags === "number") ? ((tags.length - maxTags) + 1) : null), [tagsIsLong, tags.length, maxTags])

  return (
    <TagsDiv>
      {(tagsIsLong === true && typeof maxTags === "number") ? (
        <>
        {tags.slice(0,(maxTags-1)).map((tag: TagType, index) => (
          <Tag id={tag.id} name={tag.name} index={index} onDelete={handleDelete} editable={editable}/>
        ))}
        {tags.length > maxTags ? (<Tag name={`+${extraTags}...`}/>) : (null)}
        </>
      ): (
        tags.map((tag: TagType, index) => (
          <Tag id={tag.id} name={tag.name} index={index} onDelete={handleDelete} editable={editable}/>
        ))
      )}
    </TagsDiv>
  );
};

export default TagsList;
