import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'cx330o DocForge'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <p>
            Website : <a href="https://cx330o.com">cx330o.com</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="#">
              cx330o DocForge
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://cx330o.com`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
