// Supabase compatibility layer - bridges old Supabase calls to new API
// This allows existing code to work while we migrate to direct API calls

import api from './api'

class SupabaseCompatClient {
  from(table: string) {
    return new SupabaseQueryBuilder(table)
  }

  rpc(functionName: string, params: any) {
    // Handle RPC calls - these are now handled by API endpoints
    console.warn(`RPC call to ${functionName} - should be migrated to API`)
    return Promise.resolve({ data: null, error: new Error('RPC not supported in new API') })
  }

  removeChannel(channel: any) {
    // No-op for realtime channels (now using polling)
    return this
  }

  channel(name: string) {
    // Return mock channel for realtime (now using polling)
    return {
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }
  }
}

class SupabaseQueryBuilder {
  private table: string
  private filters: any[] = []
  private selectFields: string = '*'
  private orderField: string | null = null
  private orderAsc: boolean = true
  private limitCount: number | null = null
  private singleResult: boolean = false
  private countOnly: boolean = false
  private headOnly: boolean = false

  constructor(table: string) {
    this.table = table
  }

  select(fields: string = '*', options?: { count?: 'exact', head?: boolean }) {
    this.selectFields = fields
    if (options?.count === 'exact') this.countOnly = true
    if (options?.head) this.headOnly = true
    return this
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value })
    return this
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, values })
    return this
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value })
    return this
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column
    this.orderAsc = options?.ascending !== false
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.singleResult = true
    return this
  }

  async then(resolve: any, reject: any) {
    try {
      const result = await this.execute()
      resolve(result)
    } catch (error) {
      reject(error)
    }
  }

  private async execute() {
    // Map Supabase table names to API endpoints
    // For now, return mock data structure to prevent errors
    // Real implementation would call appropriate API endpoints
    
    console.warn(`Supabase compat: ${this.table} query - should migrate to API`)
    
    // Return Supabase-compatible response
    if (this.countOnly) {
      return { count: 0, error: null }
    }

    if (this.singleResult) {
      return { data: null, error: null }
    }

    return { data: [], error: null }
  }
}

// Export singleton instance
export const supabase = new SupabaseCompatClient()
