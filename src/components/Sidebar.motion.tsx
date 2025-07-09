import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/components/ThemeProvider";
import { FaSitemap, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
	{
		to: "/bst",
		label: "Binary search trees",
		Icon: FaSitemap,
		aria: "Tree structure",
	},
];

/**
 * Sidebar navigation component for the application, supporting dark/light mode toggle and responsive mobile/desktop layouts.
 */
export default function Sidebar() {
	const { prefersDarkMode, toggleTheme } = useTheme();
	const [hovered, setHovered] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	
	const linkBase =
		"relative flex items-center gap-3 no-underline hover:text-blue-400 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200";
	const linkText = "text-zinc-900 dark:text-zinc-100";

	// Check if we're on a subroute (not the main index page)
	const isOnSubroute = location.pathname !== '/';

	// Get current page title
	const currentPageTitle = navItems.find(item => item.to === location.pathname)?.label || 'Structures';

	const handleBackClick = () => {
		navigate({ to: '/' });
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const SidebarContent = () => (
		<>
			<div className="font-bold text-2xl mb-8 flex items-center justify-between">
				<div className="flex items-center gap-3">
					{/* Back Button - only show on subroutes */}
					{isOnSubroute && (
						<motion.button
							onClick={() => {
								handleBackClick();
								closeMobileMenu();
							}}
							className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.2 }}
						>
							<ArrowLeft size={16} />
						</motion.button>
					)}
					<span className="font-sans-tight font-extrabold">Structures</span>
				</div>
				<label className="ml-4 flex items-center cursor-pointer select-none">
					<input
						type="checkbox"
						checked={prefersDarkMode}
						onChange={toggleTheme}
						className="sr-only"
						aria-label="Toggle dark/light mode"
					/>
					<span className="w-10 h-6 flex items-center bg-gray-400 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300">
						<span
							className={`w-4 h-4 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
								prefersDarkMode ? "translate-x-4" : ""
							}`}
						>
							{prefersDarkMode ? (
								<FaMoon
									className="text-gray-700 dark:text-yellow-300"
									size={10}
								/>
							) : (
								<FaSun className="text-yellow-400" size={10} />
							)}
						</span>
					</span>
				</label>
			</div>
			<nav className="flex flex-col gap-5">
				{navItems.map(({ to, label, Icon, aria }) => {
					const isActive = location.pathname === to;
					return (
						<div
							key={to}
							className="relative"
							onMouseEnter={() => setHovered(to)}
							onMouseLeave={() => setHovered(null)}
						>						<AnimatePresence>
							{hovered === to && !isActive && (
								<motion.div
									layoutId="sidebar-hover-bg"
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.98 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 30,
									}}
									className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-lg z-0"
								/>
							)}
							{isActive && (
								<motion.div
									layoutId="sidebar-active-bg"
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.98 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 30,
									}}
									className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg z-0"
								/>
							)}
						</AnimatePresence>
							<Link
								to={to}
								onClick={closeMobileMenu}
								className={`${linkBase} z-10 ${
									isActive 
										? "text-blue-600 dark:text-blue-400 font-medium" 
										: linkText
								}`}
								tabIndex={0}
							>
								<Icon aria-label={aria} />
								{label}
							</Link>
						</div>
					);
				})}
			</nav>
		</>
	);

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden lg:flex w-80 h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex-col p-6 box-border border-r border-gray-200 dark:border-zinc-700">
				<SidebarContent />
			</aside>

			{/* Mobile Navbar */}
			<div className="lg:hidden">
				{/* Top navbar */}
				<div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
					<div className="flex items-center gap-3">
						{isOnSubroute && (
							<button
								onClick={handleBackClick}
								className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
							>
								<ArrowLeft size={20} />
							</button>
						)}
						<span className="font-sans-tight font-extrabold text-xl">
							{isOnSubroute ? currentPageTitle : 'Structures'}
						</span>
					</div>
					
					<div className="flex items-center gap-3">
						{/* Theme toggle */}
						<label className="flex items-center cursor-pointer select-none">
							<input
								type="checkbox"
								checked={prefersDarkMode}
								onChange={toggleTheme}
								className="sr-only"
								aria-label="Toggle dark/light mode"
							/>
							<span className="w-8 h-5 flex items-center bg-gray-400 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300">
								<span
									className={`w-3 h-3 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
										prefersDarkMode ? "translate-x-3" : ""
									}`}
								>
									{prefersDarkMode ? (
										<FaMoon
											className="text-gray-700 dark:text-yellow-300"
											size={8}
										/>
									) : (
										<FaSun className="text-yellow-400" size={8} />
									)}
								</span>
							</span>
						</label>
						
						{/* Hamburger menu button */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
							aria-label="Toggle menu"
						>
							{isMobileMenuOpen ? (
								<FaTimes size={20} />
							) : (
								<FaBars size={20} />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu overlay */}
				<AnimatePresence>
					{isMobileMenuOpen && (
						<>
							{/* Backdrop */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
								onClick={closeMobileMenu}
							/>
							
							{/* Mobile menu for md+ screens (slide from left) */}
							<motion.div
								initial={{ x: "-100%" }}
								animate={{ x: 0 }}
								exit={{ x: "-100%" }}
								transition={{ 
									type: "spring", 
									stiffness: 300, 
									damping: 30 
								}}
								className="fixed top-0 left-0 w-80 h-full bg-white dark:bg-zinc-900 z-50 border-r border-gray-200 dark:border-zinc-700 hidden md:block"
							>
								{/* Mobile menu header */}
								<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
									<span className="font-sans-tight font-extrabold text-xl">Structures</span>
									<button
										onClick={closeMobileMenu}
										className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
									>
										<FaTimes size={20} />
									</button>
								</div>
								
								{/* Mobile menu content */}
								<div className="p-6">
									<SidebarContent />
								</div>
							</motion.div>

							{/* Mobile menu for sm screens (fade) */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed top-0 left-0 w-full h-full bg-white dark:bg-zinc-900 z-50 md:hidden"
							>
								{/* Mobile menu header */}
								<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
									<span className="font-sans-tight font-extrabold text-xl">Structures</span>
									<button
										onClick={closeMobileMenu}
										className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
									>
										<FaTimes size={20} />
									</button>
								</div>
								
								{/* Mobile menu content */}
								<div className="p-6">
									<SidebarContent />
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}
