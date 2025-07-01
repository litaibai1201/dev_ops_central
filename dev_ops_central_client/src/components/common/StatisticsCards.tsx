import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';

interface StatisticData {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  valueStyle?: React.CSSProperties;
  color?: string;
}

interface StatisticsCardsProps {
  data: StatisticData[];
  gutter?: [number, number];
  span?: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ 
  data, 
  gutter = [16, 16],
  span = 6
}) => {
  const getValueStyle = (item: StatisticData) => {
    const baseStyle = item.valueStyle || {};
    if (item.color) {
      return { ...baseStyle, color: item.color };
    }
    return baseStyle;
  };

  return (
    <Row gutter={gutter}>
      {data.map((item, index) => (
        <Col key={index} xs={24} sm={12} lg={span}>
          <Card>
            <Statistic
              title={item.title}
              value={item.value}
              prefix={item.prefix}
              suffix={item.suffix}
              valueStyle={getValueStyle(item)}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;
