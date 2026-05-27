import type ClashgramClient from '../../MockClient';

import Api from '../../../tl/api';

export default async function<A, R>(mockClient: ClashgramClient, request: Api.Request<A, R>) {
  if (request instanceof Api.messages.GetForumTopics) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  return 'pass';
}
