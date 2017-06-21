import axios from 'axios';

import article from './article';
import getFlags from './flags';
import getOnwardJourney from './onward-journey';

export default async () => {
  const d = await article();
  const flags = await getFlags();
  const onwardJourney = await getOnwardJourney();

  try {
    const table = (await axios('http://bertha.ig.ft.com/view/publish/gss/1SKYuVtt0H_qqxkyrgDjG1BaD7QKLcHVCq9cNTeV0d18/data')).data;

    return {
      ...d,
      flags,
      onwardJourney,
      table,
    };
  } catch (e) {
    console.error('Error getting content from Bertha'); // eslint-disable-line
    return {
      ...d,
      flags,
      onwardJourney,
    };
  }
};
