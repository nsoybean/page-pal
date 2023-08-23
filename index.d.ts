declare module 'html-metadata-parser' {
  export declare class Metadata {
    meta: Meta;
    og: Meta;
    images?: { src: string }[];
  }
  export declare const parser: (
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<Metadata>;
  export default 'html-metadata-parser';
  export default parser;
}
