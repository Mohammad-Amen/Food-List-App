import { ListScreen } from '../../../components/ListScreen';
import { useLists } from '../../../lib/lists';
import { t } from '../../../lib/strings';

export default function SentScreen() {
  const { sent, ready } = useLists();
  return <ListScreen lists={sent} mode="sent" ready={ready} emptyText={t.emptySent} />;
}
