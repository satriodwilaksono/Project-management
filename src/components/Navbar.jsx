import { SearchIcon, PanelLeft } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import { UserButton } from '@clerk/clerk-react'

// Design tokens (from the redesign brief):
// Light — bg #E7EAF0, surface #ECEFF4, raised #F0F2F7, text #303746/#737C8E/#9AA3B3
// Dark  — bg #151619, surface #222630, raised #292E39, inner #303643, text #F1F3F7/#9AA3B5
// Shadows are intentionally subtle (low-opacity rgba, small offsets) — this is
// restrained neumorphism, not the heavy embossed style from earlier passes.

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <div className="w-full bg-[#E7EAF0] dark:bg-[#151619] px-6 xl:px-16 py-2.5 flex-shrink-0 relative z-10 shadow-[0_1px_0_rgba(80,90,110,0.1)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="sm:hidden w-9 h-9 flex items-center justify-center rounded-[10px] text-[#737C8E] dark:text-[#9AA3B5] transition-all duration-200
                            bg-[#F0F2F7] dark:bg-[#292E39]
                            shadow-[3px_3px_7px_rgba(80,90,110,0.16),-3px_-3px_7px_rgba(255,255,255,0.65)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.3),-3px_-3px_7px_rgba(255,255,255,0.035)]
                            active:shadow-[inset_2px_2px_5px_rgba(80,90,110,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]"
                    >
                        <PanelLeft size={18} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B3] dark:text-[#6b7280] size-3.5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search projects, tasks..."
                            className="pl-9 pr-4 py-2 w-full bg-[#F0F2F7] dark:bg-[#222630] rounded-[14px] border-none outline-none text-sm text-[#303746] dark:text-[#F1F3F7] placeholder-[#9AA3B3] dark:placeholder-[#6b7280] transition-shadow duration-200
                                shadow-[inset_2px_2px_5px_rgba(80,90,110,0.14),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
                                focus:shadow-[inset_2px_2px_5px_rgba(80,90,110,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.65),0_0_0_2px_rgba(76,141,255,0.3)] dark:focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.03),0_0_0_2px_rgba(76,141,255,0.4)]"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button
                        onClick={() => dispatch(toggleTheme())}
                        className="size-9 flex items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                            bg-[#F0F2F7] dark:bg-[#292E39]
                            shadow-[3px_3px_7px_rgba(80,90,110,0.16),-3px_-3px_7px_rgba(255,255,255,0.65)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.3),-3px_-3px_7px_rgba(255,255,255,0.035)]
                            active:shadow-[inset_2px_2px_5px_rgba(80,90,110,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]"
                    >
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-[#4C8DFF]" />)
                                : (<SunIcon className="size-4 text-[#FF6B35]" />)
                        }
                    </button>

                    {/* User Button */}
                    <UserButton />
                </div>
            </div>
        </div>
    )
}

export default Navbar