import { AsyncLocalStorage } from 'async_hooks';

export interface User {
  id: string;
  email: string;
}

export const UserStorage = {
  storage: new AsyncLocalStorage<User>(),
  get() {
    return this.storage.getStore();
  },
  set(user: User) {
    return this.storage.enterWith(user);
  },
};
