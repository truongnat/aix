/**
 * Plugin system for skills
 * Provides dependency injection and plugin registration for extensible skill loading
 */

export interface Plugin<T = unknown> {
  name: string;
  version: string;
  initialize?(context: PluginContext): Promise<void> | void;
  destroy?(): Promise<void> | void;
  exports?: T;
}

export interface PluginContext {
  registerService<T>(name: string, service: T): void;
  getService<T>(name: string): T | undefined;
  config: Record<string, unknown>;
}

export interface PluginManager {
  register<T>(plugin: Plugin<T>): void;
  unregister(name: string): void;
  getPlugin<T>(name: string): Plugin<T> | undefined;
  initializeAll(): Promise<void>;
  destroyAll(): Promise<void>;
}

class SimplePluginManager implements PluginManager {
  private plugins = new Map<string, Plugin>();
  private services = new Map<string, unknown>();

  register<T>(plugin: Plugin<T>): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.destroy?.();
      this.plugins.delete(name);
    }
  }

  getPlugin<T>(name: string): Plugin<T> | undefined {
    return this.plugins.get(name) as Plugin<T> | undefined;
  }

  async initializeAll(): Promise<void> {
    const context: PluginContext = {
      registerService: <T>(name: string, service: T) => {
        this.services.set(name, service);
      },
      getService: <T>(name: string): T | undefined => {
        return this.services.get(name) as T | undefined;
      },
      config: {},
    };

    for (const plugin of this.plugins.values()) {
      await plugin.initialize?.(context);
    }
  }

  async destroyAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.destroy?.();
    }
    this.plugins.clear();
    this.services.clear();
  }
}

export function createPluginManager(): PluginManager {
  return new SimplePluginManager();
}

/**
 * Dependency injection container for skill dependencies
 */
export class DIContainer {
  private services = new Map<string, { factory: () => unknown; instance: unknown | null }>();
  private singletons = new Map<string, unknown>();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, instance: null });
  }

  registerSingleton<T>(name: string, instance: T): void {
    this.singletons.set(name, instance);
  }

  resolve<T>(name: string): T | undefined {
    // Check singleton first
    if (this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    // Check service factory
    const service = this.services.get(name);
    if (!service) return undefined;

    if (service.instance === null) {
      service.instance = service.factory();
    }

    return service.instance as T;
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

export function createDIContainer(): DIContainer {
  return new DIContainer();
}
