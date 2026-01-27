import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;

        if (i18n.language === 'ar') {
            document.body.classList.add('arabic-font');
        } else {
            document.body.classList.remove('arabic-font');
        }
    }, [i18n.language]);

    return (
        <div className="language-switcher">
            <button
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
            <button
                className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
                onClick={() => changeLanguage('ar')}
            >
                عربي
            </button>
        </div>
    );
};

export default LanguageSwitcher;
