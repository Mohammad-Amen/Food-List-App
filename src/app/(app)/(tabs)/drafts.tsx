import { ListScreen } from '../../../components/ListScreen';
import { useLists } from '../../../lib/lists';
import { t } from '../../../lib/strings';

export default function DraftsScreen() {
  const { drafts, ready } = useLists();
  return <ListScreen lists={drafts} mode="draft" ready={ready} emptyText={t.emptyDrafts} />;
}
