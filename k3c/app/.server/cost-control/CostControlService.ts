import getConfig from 'config.server';
import logger from '~/.server/logger/LoggerServiceProvider';
import {
  Configuration,
  ContextDataResourceApi,
  type EntityType,
  MetricsResourceApi,
  PricingRulesResourceApi,
} from './rest';

import type { ContextDataSaveRequest } from './rest';

export class CostControlService {
  private contextApi: ContextDataResourceApi;
  private metricsApi: MetricsResourceApi;
  private pricingRulesApi: PricingRulesResourceApi;

  constructor() {
    const appConfig = getConfig();
    const config = new Configuration({
      basePath: appConfig.costControlUrl,
      username: appConfig.costControlBasicAuthUser,
      password: appConfig.costControlBasicAuthPassword,
    });
    this.contextApi = new ContextDataResourceApi(config);
    this.metricsApi = new MetricsResourceApi(config);
    this.pricingRulesApi = new PricingRulesResourceApi(config);
  }

  async getAllContexts() {
    logger.info('Getting all contexts');
    try {
      return await this.contextApi.apiV1ContextDataGet();
    } catch (error) {
      logger.error('Error fetching contexts', { error });
      return [];
    }
  }

  async saveContext(request: ContextDataSaveRequest) {
    logger.info('Saving context', { request });
    try {
      return await this.contextApi.apiV1ContextDataPost({
        contextDataSaveRequest: request,
      });
    } catch (error) {
      logger.error('Error saving context', { error, request });
      throw error;
    }
  }

  async deleteContext(id: string) {
    logger.info('Deleting context', { id });
    try {
      return await this.contextApi.apiV1ContextDataDelete({
        contextDataDeleteRequest: { id },
      });
    } catch (error) {
      logger.error('Error deleting context', {
        error,
        id,
      });
      throw error;
    }
  }

  async getMatchingContexts(resourceName: string) {
    logger.info('Getting matching contexts', { resourceName });
    try {
      return await this.contextApi.apiV1ContextDataTestGet({
        testString: resourceName,
      });
    } catch (error) {
      logger.error('Error fetching matching contexts', {
        error,
        resourceName,
      });
      return [];
    }
  }

  async getMetricsNames() {
    logger.info('Getting metrics names');
    try {
      return await this.metricsApi.apiV1MetricsNamesGet();
    } catch (error) {
      logger.error('Error fetching metrics names', { error });
      return [];
    }
  }

  async getPricingRules() {
    logger.info('Getting pricing rules');
    try {
      return await this.pricingRulesApi.apiV1PricingRulesGet();
    } catch (error) {
      logger.error('Error fetching pricing rules', { error });
      return [];
    }
  }
}
