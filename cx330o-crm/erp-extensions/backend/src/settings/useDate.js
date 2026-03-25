const useDate = ({ settings }) => {
  const { cx330o_app_date_format } = settings;

  const dateFormat = cx330o_app_date_format;

  return {
    dateFormat,
  };
};

module.exports = useDate;
