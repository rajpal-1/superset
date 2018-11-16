// Type signature and utility functions for formData shared by all viz types
// It will be gradually filled out as we build out the query object
interface BaseFormData {
  datasource: string;
}

// FormData is either sqla-based or druid-based
interface SqlaFormData extends BaseFormData {
  granularity_sqla: string;
}

interface DruidFormData extends BaseFormData {
  granularity: string;
}

export type FormData = SqlaFormData | DruidFormData;

export function getGranularity(formData: FormData): string {
  if ('granularity_sqla' in formData) {
    return formData.granularity_sqla;
  } else {
    return formData.granularity;
  }
}
