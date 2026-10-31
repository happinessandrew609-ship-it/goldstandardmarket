import React from 'react';

export type TNavItem = {
    index: number;
    label: string;
    icon: React.ReactNode;
};

type TMainNavProps = {
    items: TNavItem[];
    activeIndex: number;
    onTabClick: (index: number) => void;
};

export const MainNav: React.FC<TMainNavProps> = ({ items, activeIndex, onTabClick }) => {
    return (
        <nav className='main-nav'>
            <div className='main-nav__track'>
                {items.map(item => (
                    <button
                        key={item.index}
                        className={`main-nav__item${activeIndex === item.index ? ' main-nav__item--active' : ''}`}
                        onClick={() => onTabClick(item.index)}
                    >
                        <span className='main-nav__icon'>{item.icon}</span>
                        <span className='main-nav__label'>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MainNav;
