// All user-facing text (Arabic).

export const t = {
  appName: 'قائمتي',

  // Auth
  signIn: 'تسجيل الدخول',
  signUp: 'إنشاء حساب',
  signOut: 'تسجيل الخروج',
  displayName: 'اسمك',
  displayNameHint: 'سنضيف لاسمك أربعة أرقام عشوائية ليصبح اسم المستخدم الخاص بك، مثل: أمي#4821',
  handle: 'اسم المستخدم',
  handleHint: 'مثال: أمي#4821',
  password: 'كلمة المرور',
  passwordHint: '6 أحرف على الأقل',
  noAccount: 'ليس لديك حساب؟ أنشئ حساباً',
  haveAccount: 'لديك حساب؟ سجّل الدخول',
  forgotWarning: 'تنبيه: لا يمكن استرجاع كلمة المرور إذا نسيتها. احفظها في مكان آمن.',
  welcomeTitle: 'أهلاً بك!',
  yourHandleIs: 'اسم المستخدم الخاص بك هو:',
  shareHandleHint: 'أعطِ هذا الاسم لعائلتك ليتمكنوا من إرسال القوائم إليك.',
  continue: 'متابعة',

  // Tabs
  inbox: 'الواردة',
  sent: 'المرسلة',
  drafts: 'مسوداتي',
  profile: 'حسابي',

  // Lists
  newList: 'قائمة جديدة',
  listTitle: 'اسم القائمة',
  listTitlePlaceholder: 'مثال: أغراض البيت',
  create: 'إنشاء',
  from: 'من',
  to: 'إلى',
  items: 'غرض',
  emptyInbox: 'لا توجد قوائم واردة بعد.\nعندما يرسل لك أحد قائمة ستظهر هنا.',
  emptySent: 'لم ترسل أي قائمة بعد.',
  emptyDrafts: 'لا توجد مسودات.\nاضغط على "قائمة جديدة" للبدء.',
  emptyItems: 'القائمة فارغة. أضف أول غرض!',
  statusDraft: 'مسودة',
  statusSent: 'جديدة',
  statusSentOwner: 'بانتظار المشاهدة',
  statusSeen: 'تمت المشاهدة',
  bought: 'تم الشراء',
  addedBy: 'أضافه',
  progress: (done: number, total: number) => `تم شراء ${done} من ${total}`,

  // Actions
  send: 'إرسال',
  sendTo: 'إرسال إلى',
  sendCopy: 'إرسال نسخة لشخص آخر',
  duplicate: 'استخدام القائمة مرة أخرى',
  shareText: 'مشاركة كنص',
  markSeen: 'تمت المشاهدة ✓',
  markSeenConfirmTitle: 'تأكيد المشاهدة',
  markSeenConfirm: 'بعد التأكيد لن يتمكن أحد من تعديل الأغراض أو إضافة غيرها، ويمكنكما فقط تعليم ما تم شراؤه. لا يمكن التراجع عن هذا.',
  confirm: 'تأكيد',
  cancel: 'إلغاء',
  delete: 'حذف',
  deleteList: 'حذف المسودة',
  deleteListConfirm: 'هل تريد حذف هذه المسودة؟',
  deleteItemConfirm: 'هل تريد حذف هذا الغرض؟',
  save: 'حفظ',
  rename: 'تغيير الاسم',
  copy: 'نسخ',
  copied: 'تم النسخ',
  share: 'مشاركة',

  // Lock messages
  lockedSeen: '🔒 تمت مشاهدة القائمة — لا يمكن تعديل الأغراض، فقط تعليم ما تم شراؤه.',
  draftHint: 'هذه مسودة. أضف الأغراض ثم اضغط "إرسال".',
  sentHintOwner: 'يمكنك أنت والمستلم التعديل حتى يضغط المستلم "تمت المشاهدة".',
  sentHintRecipient: 'يمكنك إضافة الأغراض وتعديلها. عندما تنتهي اضغط "تمت المشاهدة".',

  // Item editor
  addItem: 'إضافة غرض',
  editItem: 'تعديل الغرض',
  itemName: 'اسم الغرض',
  quantity: 'الكمية',
  unit: 'الوحدة',
  category: 'القسم',
  note: 'ملاحظة (اختياري)',
  notePlaceholder: 'مثال: النوع الأحمر',
  quickAdd: 'إضافة سريعة',
  addWithDetails: '＋ إضافة مع التفاصيل (الكمية، الوحدة، ملاحظة)',
  add: 'إضافة',

  // Send screen
  sendToHint: 'اكتب اسم المستخدم كاملاً مع الأرقام',
  find: 'بحث',
  recentPeople: 'أشخاص سابقون',
  userNotFound: 'لم نجد مستخدماً بهذا الاسم.',
  cantSendToSelf: 'لا يمكنك إرسال القائمة لنفسك.',
  sentSuccess: 'تم الإرسال!',

  // Profile
  shareMyHandle: 'شارك اسم المستخدم',
  shareMessage: (handle: string) => `أرسل لي قوائمك على تطبيق قائمتي! اسم المستخدم الخاص بي: ${handle}`,

  // Errors
  error: 'حدث خطأ',
  errBadHandle: 'اسم المستخدم غير صحيح. يجب أن يكون مثل: أمي#4821',
  errWrongLogin: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
  errWeakPassword: 'كلمة المرور قصيرة. استخدم 6 أحرف على الأقل.',
  errNetwork: 'لا يوجد اتصال بالإنترنت.',
  errNameShort: 'الاسم قصير جداً.',
  errNameLong: 'الاسم طويل جداً (12 حرفاً كحد أقصى).',
  errNameChars: 'الاسم يحتوي على رموز غير مسموحة.',
  errPermission: 'لا يمكنك القيام بهذا الإجراء — ربما تمت مشاهدة القائمة.',
  errTooMany: 'محاولات كثيرة. حاول لاحقاً.',
  errNotConfigured: 'لم يتم إعداد Firebase بعد. راجع ملف README.',
  listNotFound: 'القائمة غير موجودة أو تم حذفها.',
};

export function errorMessage(e: unknown): string {
  const code = (e as any)?.code ?? '';
  switch (code) {
    case 'app/bad-handle':
      return t.errBadHandle;
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return t.errWrongLogin;
    case 'auth/weak-password':
      return t.errWeakPassword;
    case 'auth/network-request-failed':
    case 'unavailable':
      return t.errNetwork;
    case 'auth/too-many-requests':
      return t.errTooMany;
    case 'permission-denied':
      return t.errPermission;
    default:
      return `${t.error}${code ? ` (${code})` : ''}`;
  }
}

export function formatDate(ms: number | null): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('ar', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
}
