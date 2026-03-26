import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/app-shell';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
    useRouter: vi.fn(),
}));

describe('AppShell', () => {
    it('renders nav links', () => {
        (usePathname as any).mockReturnValue('/app');
        render(<AppShell>Test content</AppShell>);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Subjects')).toBeInTheDocument();
    });

    it('highlights active nav', () => {
        (usePathname as any).mockReturnValue('/app/subjects');
        render(<AppShell>Test content</AppShell>);
        const subjectsLink = screen.getByText('Subjects');
        expect(subjectsLink).toHaveClass('bg-slate-950 text-white');
    });
});
