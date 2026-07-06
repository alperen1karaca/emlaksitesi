"use client";
import { motion } from "framer-motion";
import { Shield, FileText, Lock, Cookie, Megaphone, AlertTriangle } from "lucide-react";

const sections = [
    {
        id: "kvkk",
        icon: Shield,
        title: "KVKK Aydınlatma Metni",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL olarak, kullanıcılarımızın kişisel verilerinin korunmasına büyük önem vermekteyiz. Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır." },
            { subtitle: "1. Veri Sorumlusu", text: "Bu aydınlatma metni kapsamında veri sorumlusu SSGAYRİMENKUL'dür." },
            { subtitle: "2. Toplanan Kişisel Veriler", text: "Sitemizi kullanmanız sırasında aşağıdaki veriler toplanabilir:\n• Ad ve soyad\n• Telefon numarası\n• E-posta adresi\n• IP adresi\n• Kullanıcı işlem bilgileri\n• Mesaj ve iletişim içerikleri" },
            { subtitle: "3. Kişisel Verilerin Toplanma Amaçları", text: "Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:\n• Kullanıcı hesaplarının oluşturulması\n• Gayrimenkul ilanlarının yayınlanması\n• Kullanıcılar arasında iletişimin sağlanması\n• Müşteri destek hizmetlerinin sunulması\n• Site güvenliğinin sağlanması\n• Yasal yükümlülüklerin yerine getirilmesi" },
            { subtitle: "4. Kişisel Verilerin Aktarılması", text: "Kişisel veriler;\n• Yetkili kamu kurumları\n• Hukuki yükümlülükler kapsamında resmi makamlar\n• Teknik altyapı sağlayıcıları\nile sınırlı olmak üzere paylaşılabilir." },
            { subtitle: "5. Veri Sahibinin Hakları", text: "KVKK'nın 11. maddesi kapsamında kullanıcılar:\n• Kişisel verilerinin işlenip işlenmediğini öğrenme\n• İşlenen verilere ilişkin bilgi talep etme\n• Verilerin düzeltilmesini isteme\n• Verilerin silinmesini talep etme\nhaklarına sahiptir." },
            { subtitle: "6. İletişim", text: "KVKK kapsamındaki taleplerinizi aşağıdaki iletişim adresi üzerinden iletebilirsiniz.\n\nSSGAYRİMENKUL\nE-posta: sefabeyazitlioglu@hotmail.com" },
        ],
    },
    {
        id: "kullanim-kosullari",
        icon: FileText,
        title: "Kullanım Koşulları",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL internet sitesini kullanan tüm ziyaretçiler aşağıdaki kullanım koşullarını kabul etmiş sayılır." },
            { subtitle: "1. Hizmet Tanımı", text: "SSGAYRİMENKUL, kullanıcıların gayrimenkul ilanlarını yayınlayabildiği ve inceleyebildiği bir platformdur." },
            { subtitle: "2. Kullanıcı Sorumlulukları", text: "Kullanıcılar;\n• Doğru ve güncel bilgiler paylaşmak\n• Sahte veya yanıltıcı ilan yayınlamamak\n• Başkalarına ait hakları ihlal etmemek\nile yükümlüdür." },
            { subtitle: "3. İlan Sorumluluğu", text: "Platformda yayınlanan ilanların doğruluğu ve içeriği ilan sahibinin sorumluluğundadır. SSGAYRİMENKUL ilanların doğruluğunu garanti etmez." },
            { subtitle: "4. Hizmet Değişiklikleri", text: "SSGAYRİMENKUL gerekli gördüğü durumlarda site içeriğini değiştirme, güncelleme veya hizmetleri durdurma hakkını saklı tutar." },
            { subtitle: "5. Hesap Güvenliği", text: "Kullanıcılar hesap bilgilerinin gizliliğinden sorumludur." },
            { subtitle: "6. Hukuki Yetki", text: "Bu kullanım koşulları Türkiye Cumhuriyeti kanunlarına tabidir." },
        ],
    },
    {
        id: "gizlilik",
        icon: Lock,
        title: "Gizlilik Politikası",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL kullanıcı gizliliğine önem vermektedir. Bu politika, kullanıcı bilgilerinin nasıl toplandığını ve kullanıldığını açıklamaktadır." },
            { subtitle: "Toplanan Bilgiler", text: "Sitemizi kullanırken aşağıdaki bilgiler toplanabilir:\n• İletişim bilgileri\n• IP adresi\n• Kullanım istatistikleri\n• Cihaz bilgileri" },
            { subtitle: "Bilgilerin Kullanımı", text: "Toplanan bilgiler:\n• Hizmet kalitesini artırmak\n• Kullanıcı deneyimini geliştirmek\n• Güvenliği sağlamak\namacıyla kullanılmaktadır." },
            { subtitle: "Bilgi Güvenliği", text: "SSGAYRİMENKUL kullanıcı verilerinin korunması için gerekli teknik ve idari önlemleri almaktadır." },
            { subtitle: "Üçüncü Taraf Hizmetleri", text: "Sitemizde analiz ve teknik altyapı hizmetleri için üçüncü taraf servisler kullanılabilir." },
        ],
    },
    {
        id: "cerez",
        icon: Cookie,
        title: "Çerez Politikası",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL internet sitesi kullanıcı deneyimini geliştirmek amacıyla çerezler kullanmaktadır." },
            { subtitle: "Çerez Nedir", text: "Çerezler, ziyaret ettiğiniz web siteleri tarafından cihazınıza kaydedilen küçük veri dosyalarıdır." },
            { subtitle: "Kullanılan Çerez Türleri", text: "• Zorunlu çerezler\n• Performans çerezleri\n• Analitik çerezler" },
            { subtitle: "Çerezlerin Kullanım Amaçları", text: "• Site performansını artırmak\n• Kullanıcı tercihlerini hatırlamak\n• İstatistiksel analiz yapmak" },
            { subtitle: "Çerez Yönetimi", text: "Kullanıcılar tarayıcı ayarlarından çerezleri kontrol edebilir veya silebilir." },
        ],
    },
    {
        id: "ilan",
        icon: Megaphone,
        title: "İlan Yayınlama Kuralları",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL platformunda yayınlanan ilanların güvenilirliğini sağlamak amacıyla aşağıdaki kurallar uygulanmaktadır." },
            { subtitle: "1. Doğru Bilgi Zorunluluğu", text: "İlanlarda yer alan tüm bilgiler doğru ve güncel olmalıdır." },
            { subtitle: "2. Sahte İlan Yasağı", text: "Gerçek olmayan veya yanıltıcı ilanlar yayınlanamaz." },
            { subtitle: "3. Tekrarlanan İlanlar", text: "Aynı gayrimenkul için birden fazla ilan yayınlanması yasaktır." },
            { subtitle: "4. Fiyat Manipülasyonu", text: "Yanıltıcı fiyat bilgisi verilmesi yasaktır." },
            { subtitle: "5. Kural İhlalleri", text: "Kurallara uymayan ilanlar SSGAYRİMENKUL tarafından kaldırılabilir ve kullanıcı hesapları askıya alınabilir." },
        ],
    },
    {
        id: "sorumluluk",
        icon: AlertTriangle,
        title: "Sorumluluk Reddi",
        content: [
            { subtitle: "", text: "SSGAYRİMENKUL, gayrimenkul alım, satım ve kiralama alanında faaliyet gösteren bir emlak şirketidir. İnternet sitesi üzerinden sunulan ilanlar ve bilgiler, kullanıcıların gayrimenkul fırsatlarını inceleyebilmesi amacıyla paylaşılmaktadır." },
            { subtitle: "", text: "Sitede yer alan ilanlar ve içerikler, SSGAYRİMENKUL tarafından hazırlanmış veya ilan sahipleri tarafından sisteme eklenmiş olabilir. İlanlarda yer alan fiyat, konum, özellik ve diğer bilgiler zaman içerisinde değişiklik gösterebilir." },
            { subtitle: "", text: "SSGAYRİMENKUL, site üzerinde yer alan bilgilerin doğru ve güncel olması için gerekli özeni göstermektedir. Ancak ilan içeriklerinde oluşabilecek hatalar, eksiklikler veya üçüncü kişiler tarafından sağlanan bilgilerden kaynaklanan farklılıklardan dolayı doğabilecek zararlardan sorumlu tutulamaz." },
            { subtitle: "", text: "Kullanıcıların gayrimenkul alım, satım veya kiralama işlemleri öncesinde gerekli araştırmaları yapmaları önerilir. Sitede yer alan bilgiler yatırım veya hukuki danışmanlık niteliği taşımaz." },
            { subtitle: "", text: "SSGAYRİMENKUL, gerekli gördüğü durumlarda site içeriğini değiştirme, güncelleme veya kaldırma hakkını saklı tutar." },
        ],
    },
];

export default function LegalInfoPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero */}
            <div className="bg-secondary text-white py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-4"
                    >
                        Yasal Bilgiler
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-sm md:text-base max-w-2xl mx-auto"
                    >
                        SSGAYRİMENKUL olarak şeffaflık ve güvenilirlik ilkelerimiz doğrultusunda tüm yasal bilgilendirmelerimizi bu sayfada bulabilirsiniz.
                    </motion.p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="max-w-5xl mx-auto px-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-colors text-center group"
                            >
                                <Icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-wider leading-tight">
                                    {section.title}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Sections */}
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-12">
                {sections.map((section, sIdx) => {
                    const Icon = section.icon;
                    return (
                        <motion.section
                            key={section.id}
                            id={section.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: sIdx * 0.05 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden scroll-mt-24"
                        >
                            <div className="flex items-center gap-3 px-6 md:px-8 py-5 bg-gradient-to-r from-secondary to-gray-800 text-white">
                                <Icon size={22} />
                                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">{section.title}</h2>
                            </div>
                            <div className="px-6 md:px-8 py-6 space-y-4">
                                {section.content.map((item, i) => (
                                    <div key={i}>
                                        {item.subtitle && (
                                            <h3 className="text-sm md:text-base font-bold text-secondary mb-1">{item.subtitle}</h3>
                                        )}
                                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    );
                })}
            </div>
        </main>
    );
}
