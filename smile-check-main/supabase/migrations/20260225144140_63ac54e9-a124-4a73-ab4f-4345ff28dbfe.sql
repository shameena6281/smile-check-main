
-- Tighten employees write policies to admin only
DROP POLICY "Authenticated users can insert employees" ON public.employees;
DROP POLICY "Authenticated users can update employees" ON public.employees;
DROP POLICY "Authenticated users can delete employees" ON public.employees;

CREATE POLICY "Admins can insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update employees" ON public.employees FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete employees" ON public.employees FOR DELETE TO authenticated USING (public.is_admin());

-- Tighten attendance write policies to admin only
DROP POLICY "Authenticated users can insert attendance" ON public.attendance_records;
DROP POLICY "Authenticated users can update attendance" ON public.attendance_records;
DROP POLICY "Authenticated users can delete attendance" ON public.attendance_records;

CREATE POLICY "Admins can insert attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete attendance" ON public.attendance_records FOR DELETE TO authenticated USING (public.is_admin());
