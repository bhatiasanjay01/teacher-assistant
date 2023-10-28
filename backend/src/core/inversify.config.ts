import { Container } from 'inversify';
import 'reflect-metadata';

export const container = new Container({ autoBindInjectable: true, defaultScope: 'Singleton' });
