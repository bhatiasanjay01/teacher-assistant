import { injectable } from 'inversify';
import { action, resource } from '../../shared/routing/routing.decorator';
import { TestGate } from './test.gate';

@resource(TestGate.resource)
@injectable()
export class TestController {
  @action(TestGate.actions.ping)
  getPong() {
    return { response: 'pong' };
  }
}
