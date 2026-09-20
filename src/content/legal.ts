import type { LegalDoc } from "@/app/legal/[doc]/LegalView";

const UPDATED = "20 September 2026";

export const LEGAL: Record<string, LegalDoc> = {
  terms: {
    title: { en: "Terms of service", ar: "شروط الخدمة" },
    updated: UPDATED,
    sections: [
      {
        h: { en: "Who we are", ar: "من نحن" },
        p: [
          {
            en: "RootSym is a professional training practice operated by Rand Saleh from Amman, Jordan. These terms cover every workshop booked through this website.",
            ar: "روت سيم ممارسة تدريب مهني تديرها رند صالح من عمّان، الأردن. تغطي هذه الشروط كل ورشة تُحجز عبر هذا الموقع.",
          },
        ],
      },
      {
        h: { en: "Booking a seat", ar: "حجز مقعد" },
        p: [
          {
            en: "A seat is confirmed once payment has cleared. Individual bookings cover one named participant per seat. A company booking covers one private room for up to the stated maximum number of attendees.",
            ar: "يُعتبر المقعد مؤكدًا فور تأكيد الدفع. يغطي الحجز الفردي مشاركًا واحدًا باسمه لكل مقعد. أما حجز الشركة فيغطي قاعة خاصة واحدة حتى الحد الأقصى المعلن للمشاركين.",
          },
          {
            en: "Each confirmed booking receives a personal joining page. That page reveals the Microsoft Teams link once and is then sealed. The link is tied to your booking and must not be shared; if you lose it, contact us with your booking reference and a fresh one will be issued.",
            ar: "يحصل كل حجز مؤكد على صفحة دخول شخصية. تكشف هذه الصفحة رابط مايكروسوفت تيمز مرة واحدة ثم تُغلق. الرابط مرتبط بحجزك ولا يجوز مشاركته؛ وإن فقدته، راسلنا برقم حجزك وسيُصدر لك رابط جديد.",
          },
        ],
      },
      {
        h: { en: "Delivery", ar: "تقديم الورشة" },
        p: [
          {
            en: "Workshops are delivered live on Microsoft Teams. You are responsible for a working internet connection, microphone and a device capable of running Teams. Sessions are not recorded.",
            ar: "تُقدَّم الورش مباشرةً عبر مايكروسوفت تيمز. أنت مسؤول عن توفر اتصال إنترنت وميكروفون يعملان وجهاز قادر على تشغيل تيمز. ولا تُسجَّل الجلسات.",
          },
          {
            en: "If a session must be rescheduled for any reason, every booked participant is offered a place on the next cohort or a full refund.",
            ar: "إذا تعيّن تأجيل جلسة لأي سبب، يُعرض على كل مشارك محجوز مقعد في الدفعة التالية أو استرداد كامل للمبلغ.",
          },
        ],
      },
      {
        h: { en: "Materials", ar: "المواد التدريبية" },
        p: [
          {
            en: "Workbooks, templates and canvases provided during a workshop are licensed to you for use inside your own organisation. They may not be resold, published or used to deliver competing training.",
            ar: "تُرخَّص لك الأدلة والقوالب واللوحات المقدَّمة خلال الورشة للاستخدام داخل مؤسستك فقط. ولا يجوز إعادة بيعها أو نشرها أو استخدامها لتقديم تدريب منافس.",
          },
        ],
      },
      {
        h: { en: "Confidentiality", ar: "السرّية" },
        p: [
          {
            en: "Company workshops often work on real production data. Anything shared in the room stays in the room, and we are glad to sign your own NDA before delivery.",
            ar: "غالبًا ما تعمل ورش الشركات على بيانات إنتاج حقيقية. كل ما يُشارَك داخل القاعة يبقى داخلها، ويسعدنا توقيع اتفاقية عدم إفشاء خاصة بكم قبل التنفيذ.",
          },
        ],
      },
      {
        h: { en: "Liability", ar: "المسؤولية" },
        p: [
          {
            en: "Our liability in connection with any workshop is limited to the amount you paid for it. Nothing in these terms excludes liability that cannot lawfully be excluded.",
            ar: "تقتصر مسؤوليتنا المرتبطة بأي ورشة على المبلغ الذي دفعته مقابلها. ولا يستثني أي بند في هذه الشروط مسؤولية لا يجوز قانونًا استثناؤها.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: { en: "Privacy", ar: "الخصوصية" },
    updated: UPDATED,
    sections: [
      {
        h: { en: "What we collect", ar: "ما الذي نجمعه" },
        p: [
          {
            en: "When you book a seat we collect your name, email address, and optionally your phone number, organisation and job title, together with the details of the workshop you booked. When you use the contact form we collect what you type into it.",
            ar: "عند حجز مقعد نجمع اسمك وبريدك الإلكتروني، واختياريًا رقم هاتفك وجهة عملك ومسماك الوظيفي، إضافةً إلى تفاصيل الورشة التي حجزتها. وعند استخدام نموذج التواصل نجمع ما تكتبه فيه.",
          },
          {
            en: "Card details are never sent to or stored on this website. Card payments are handled entirely by Stripe on their own infrastructure.",
            ar: "لا تُرسَل بيانات البطاقات إلى هذا الموقع ولا تُخزَّن فيه إطلاقًا. تُعالَج مدفوعات البطاقات بالكامل لدى Stripe على بنيتهم التحتية.",
          },
        ],
      },
      {
        h: { en: "Why we hold it", ar: "لماذا نحتفظ بها" },
        p: [
          {
            en: "To confirm your booking, issue your joining link, deliver the workshop, answer your questions and keep the accounting records the law requires.",
            ar: "لتأكيد حجزك، وإصدار رابط دخولك، وتقديم الورشة، والإجابة على أسئلتك، والاحتفاظ بالسجلات المحاسبية التي يتطلبها القانون.",
          },
        ],
      },
      {
        h: { en: "Who else sees it", ar: "من يطّلع عليها أيضًا" },
        p: [
          {
            en: "Only the service providers that make the platform work: our hosting provider, our database provider, Stripe for payments, and our email provider for confirmation messages. We never sell your data and we do not run advertising trackers on this site.",
            ar: "فقط مزوّدو الخدمات الذين يجعلون المنصة تعمل: مزوّد الاستضافة، ومزوّد قاعدة البيانات، وStripe للمدفوعات، ومزوّد البريد لرسائل التأكيد. لا نبيع بياناتك أبدًا ولا نشغّل أدوات تتبّع إعلانية على هذا الموقع.",
          },
        ],
      },
      {
        h: { en: "Your choices", ar: "خياراتك" },
        p: [
          {
            en: "Write to us at any time to ask for a copy of what we hold about you, to correct it, or to have it deleted once our legal retention period has passed.",
            ar: "راسلنا في أي وقت لطلب نسخة مما نحتفظ به عنك، أو لتصحيحه، أو لحذفه بعد انقضاء مدة الاحتفاظ القانونية.",
          },
        ],
      },
    ],
  },

  refunds: {
    title: { en: "Refunds & rescheduling", ar: "الاسترجاع وإعادة الجدولة" },
    updated: UPDATED,
    sections: [
      {
        h: { en: "Individual seats", ar: "المقاعد الفردية" },
        p: [
          {
            en: "Cancel more than seven days before the session and you receive a full refund. Between seven days and 48 hours you can move to any future cohort at no cost. Inside 48 hours the seat is non-refundable, but you may send a colleague in your place.",
            ar: "إذا ألغيت قبل أكثر من سبعة أيام من الجلسة تحصل على استرداد كامل. وبين سبعة أيام و٤٨ ساعة يمكنك الانتقال إلى أي دفعة لاحقة دون تكلفة. أما خلال آخر ٤٨ ساعة فالمقعد غير قابل للاسترداد، لكن يمكنك إرسال زميل بدلًا عنك.",
          },
        ],
      },
      {
        h: { en: "Company rooms", ar: "قاعات الشركات" },
        p: [
          {
            en: "A private room can be rescheduled once at no cost with at least ten days' notice. Cancellations more than fourteen days ahead are refunded in full; inside fourteen days, 50% is retained to cover the reserved delivery day.",
            ar: "يمكن إعادة جدولة القاعة الخاصة مرة واحدة دون تكلفة بإشعار لا يقل عن عشرة أيام. وتُسترد الإلغاءات قبل أكثر من أربعة عشر يومًا بالكامل؛ وضمن أربعة عشر يومًا يُحتفظ بنسبة ٥٠٪ لتغطية يوم التنفيذ المحجوز.",
          },
        ],
      },
      {
        h: { en: "If we reschedule", ar: "إذا أجّلنا نحن" },
        p: [
          {
            en: "If RootSym moves or cancels a session, you always choose: a seat on the next cohort, or a full refund, no questions asked.",
            ar: "إذا قام روت سيم بتأجيل أو إلغاء جلسة، فالخيار دائمًا لك: مقعد في الدفعة التالية، أو استرداد كامل دون أي أسئلة.",
          },
        ],
      },
      {
        h: { en: "How to ask", ar: "كيف تطلب ذلك" },
        p: [
          {
            en: "Email us with your booking reference. Card refunds are returned to the original card, usually within five to ten working days. Bank transfers are returned to the account they came from.",
            ar: "راسلنا برقم حجزك. تُعاد مبالغ البطاقات إلى البطاقة الأصلية، عادةً خلال خمسة إلى عشرة أيام عمل. وتُعاد الحوالات البنكية إلى الحساب الذي جاءت منه.",
          },
        ],
      },
    ],
  },
};
