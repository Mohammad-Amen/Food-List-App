import { ListScreen } from '../../../components/ListScreen';
import { useLists } from '../../../lib/lists';
import { t } from '../../../lib/strings';

export default function InboxScreen() {
  const { inbox, ready } = useLists();
  return <ListScreen lists={inbox} mode="inbox" ready={ready} emptyText={t.emptyInbox} />;
}
