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
import React, { useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { List, Card } from 'antd';
import { Button, Col, Row, Carousel } from 'antd';
import styled from '@emotion/styled';
import { supersetTheme } from '@superset-ui/style';
import '../styles/main.less';
import {
  DeploymentUnitOutlined,
  FireOutlined,
  DotChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import GitHubButton from 'react-github-btn';
import { mq } from '../utils';
import { Databases } from '../resources/data';
import SectionHeader from '../components/SectionHeader';
import BlurredSection from '../components/BlurredSection';

const { colors } = supersetTheme;

const features = [
  {
    image: 'easy-to-use.png',
    title: 'Powerful yet easy to use',
    description:
      'Superset makes it easy to explore your data, using either our simple no-code viz builder or state-of-the-art SQL IDE.',
  },
  {
    image: 'integrates-with-databases.png',
    title: 'Integrates with modern databases',
    description:
      'Superset can connect to any SQL-based databases including modern cloud-native databases and engines at petabyte scale.',
  },
  {
    image: 'modern-architecture.png',
    title: 'Modern architecture',
    description:
      'Superset is lightweight and highly scalable, leveraging the power of your existing data infrastructure without requiring yet another ingestion layer.',
  },
  {
    image: 'rich-visualizations.png',
    title: 'Rich visualizations and dashboards',
    description:
      'Superset ships with 40+ pre-installed visualization types. Our plug-in architecture makes it easy to build custom visualizations in Superset.',
  },
];

const StyledMain = styled('main')`
  text-align: center;
`;

const StyledTitleContainer = styled('div')`
  position: relative;
  padding: 60px 20px 0;
  margin-bottom: 160px;
  background-image: url('img/hero-background.jpg');
  background-size: cover;
  .info-text {
    font-size: 30px;
    font-weight: normal;
    line-height: 37px;
    max-width: 720px;
    margin: 24px auto 10px;
    color: #f8fdff;
  }
  .github-section {
    margin-top: 9px;
    .github-button {
      margin: 5px;
    }
  }
`;

const StyledButton = styled(Link)`
  display: block;
  background: linear-gradient(180deg, #20a7c9 0%, #0c8fae 100%);
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  width: 170px;
  padding: 10px;
  margin: 15px auto 0;
  transition: all 0.3s;
  &:hover {
    color: #ffffff;
  }
`;

const StyledScreenshotContainer = styled('div')`
  position: relative;
  display: inline-block;
  padding-top: 30px;
  margin-top: 25px;
  margin-bottom: -125px;
  .screenshot {
    position: relative;
    z-index: 3;
  }
  .screenshot-shadow-1 {
    position: absolute;
    top: 15px;
    left: 20px;
    width: calc(100% - 40px);
    height: calc(100% - 15px);
    background-color: #256b7c;
    border-radius: 10px;
    z-index: 2;
  }
  .screenshot-shadow-2 {
    position: absolute;
    top: 0;
    left: 40px;
    width: calc(100% - 80px);
    height: 100%;
    background-color: #0d5262;
    border-radius: 10px;
    z-index: 1;
  }
`;

const StyledFeaturesList = styled('ul')`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 1170px;
  margin: 15px auto 0;
  .item {
    text-align: left;
    border: 1px solid #ededed;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    padding: 20px;
  }
  .image {
    flex-shrink: 0;
    margin-right: 20px;
    width: 140px;
    text-align: center;
  }
  .content {
  }
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #484848;
    margin: 10px 0 0;
  }
  .description {
    font-size: 17px;
    line-height: 23px;
    color: #5f5f5f;
    margin: 5px 0 0;
  }
`;

export default function Home(): JSX.Element {
  const slider = useRef(null);

  const [slideIndex, setSlideIndex] = useState(0);

  const onChange = index => {
    setSlideIndex(index);
  };

  return (
    <Layout
      title="Welcome"
      description="Community website for Apache Superset, a data visualization and data exploration platform"
    >
      <StyledMain>
        <StyledTitleContainer>
          <img
            className="superset-mark"
            src="img/superset-mark-dark.svg"
            alt="Superset mark"
          />
          <div className="info-text">
            Apache Superset is an open-source modern data exploration and
            visualization platform.
          </div>
          <img src="img/community/line.png" alt="line" />
          <div className="github-section">
            <span className="github-button">
              <GitHubButton
                href="https://github.com/apache/superset"
                data-size="large"
                data-show-count="true"
                aria-label="Star apache/superset on GitHub"
              >
                Star
              </GitHubButton>
            </span>
            <span className="github-button">
              <GitHubButton
                href="https://github.com/apache/superset/subscription"
                data-size="large"
                data-show-count="true"
                aria-label="Watch apache/superset on GitHub"
              >
                Watch
              </GitHubButton>
            </span>
            <span className="github-button">
              <GitHubButton
                href="https://github.com/apache/superset/fork"
                data-size="large"
                data-show-count="true"
                aria-label="Fork apache/superset on GitHub"
              >
                Fork
              </GitHubButton>
            </span>
          </div>
          <img src="img/community/line.png" alt="line" />
          <StyledButton href="/docs/intro">Get Started</StyledButton>
          <StyledScreenshotContainer>
            <img
              className="screenshot"
              src="img/hero-screenshot.png"
              alt="hero-screenshot"
            />
            <div className="screenshot-shadow-1"></div>
            <div className="screenshot-shadow-2"></div>
          </StyledScreenshotContainer>
        </StyledTitleContainer>
        <BlurredSection>
          <SectionHeader
            level="h2"
            title="Overview"
            subtitle="Superset is fast, lightweight, intuitive, and loaded with options that make it easy for users of all skill sets to explore and visualize their data, from simple line charts to highly detailed geospatial charts."
          />
          <StyledFeaturesList>
            {features.map(({ image, title, description }) => (
              <li className="item" key={title}>
                <div className="image">
                  <img src={`img/features/${image}`} />
                </div>
                <div className="content">
                  <h4 className="title">{title}</h4>
                  <p className="description">{description}</p>
                </div>
              </li>
            ))}
          </StyledFeaturesList>
        </BlurredSection>
      </StyledMain>
    </Layout>
  );
}
