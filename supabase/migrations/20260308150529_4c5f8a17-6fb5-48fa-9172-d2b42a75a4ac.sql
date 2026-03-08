
-- Add approval workflow columns to maintenance_logs
ALTER TABLE public.maintenance_logs 
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Allow finance to insert maintenance requests (submissions)
CREATE POLICY "Finance can submit maintenance requests"
ON public.maintenance_logs
FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['finance'::app_role]));

-- Allow finance to view maintenance logs (already exists as SELECT policy)
-- Allow fleet managers to update approval_status
-- (already covered by existing update policy for fleet_manager and operations)
