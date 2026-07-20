import prisma from '../../lib/prisma';
import {
  GovernmentConnector,
  ConnectorType,
  TaxFilingConnector,
  InvoiceValidationConnector,
  BusinessRegistrationConnector,
  PlaceholderConnector,
} from './government-connector.types';

/**
 * Government Connector Registry
 *
 * Manages available government connector implementations.
 * When a new government API becomes available, register it here.
 * If no implementation exists, a PlaceholderConnector is returned.
 */
class GovernmentConnectorRegistry {
  private connectors = new Map<string, GovernmentConnector>();

  /**
   * Register a connector implementation for a specific country and type.
   */
  register(countryCode: string, type: ConnectorType, connector: GovernmentConnector): void {
    const key = `${countryCode}:${type}`;
    this.connectors.set(key, connector);
  }

  /**
   * Get a connector for a specific country and type.
   * Returns a PlaceholderConnector if no implementation is registered.
   */
  getConnector(countryCode: string, type: ConnectorType): GovernmentConnector {
    const key = `${countryCode}:${type}`;
    return this.connectors.get(key) || new PlaceholderConnector(countryCode, type);
  }

  /**
   * Get a typed connector (e.g., TaxFilingConnector) if available.
   */
  getTaxFilingConnector(countryCode: string): TaxFilingConnector | null {
    const connector = this.getConnector(countryCode, 'TAX_FILING');
    if (this.isAvailable(connector) && 'fileReturn' in connector) {
      return connector as TaxFilingConnector;
    }
    return null;
  }

  getInvoiceValidationConnector(countryCode: string): InvoiceValidationConnector | null {
    const connector = this.getConnector(countryCode, 'INVOICE_VALIDATION');
    if (this.isAvailable(connector) && 'validateInvoice' in connector) {
      return connector as InvoiceValidationConnector;
    }
    return null;
  }

  getBusinessRegistrationConnector(countryCode: string): BusinessRegistrationConnector | null {
    const connector = this.getConnector(countryCode, 'BUSINESS_REGISTRATION');
    if (this.isAvailable(connector) && 'register' in connector) {
      return connector as BusinessRegistrationConnector;
    }
    return null;
  }

  private isAvailable(connector: GovernmentConnector): boolean {
    return connector.isAvailable;
  }

  /**
   * Get all connector statuses for a country from DB config.
   */
  async getConnectorStatuses(countryCode: string) {
    try {
      const config = await prisma.complianceConfig.findFirst({
        where: {
          countryCode: countryCode.toUpperCase(),
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        },
        orderBy: { effectiveFrom: 'desc' },
        include: { connectors: { where: { isActive: true } } },
      });

      if (!config) return [];

      return config.connectors.map((c) => ({
        id: c.id,
        name: c.name,
        provider: c.provider,
        type: c.type,
        isAvailable: c.isAvailable,
        isMandatory: c.isMandatory,
        baseUrl: c.baseUrl,
        authType: c.authType,
        apiVersion: c.apiVersion,
        health: c.isAvailable ? this.getConnector(c.provider, c.type as ConnectorType).isAvailable : false,
      }));
    } catch (error) {
      console.warn('[GovernmentConnector] Failed to fetch connector statuses:', error);
      return [];
    }
  }
}

export const govConnectorRegistry = new GovernmentConnectorRegistry();
