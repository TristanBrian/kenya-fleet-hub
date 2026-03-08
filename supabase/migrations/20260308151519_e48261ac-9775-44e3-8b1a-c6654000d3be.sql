
-- Allow finance to update their own rejected submissions back to pending
CREATE POLICY "Finance can resubmit their rejected requests"
ON public.maintenance_logs
FOR UPDATE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['finance'::app_role])
  AND submitted_by = auth.uid()
  AND approval_status = 'rejected'
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['finance'::app_role])
  AND approval_status = 'pending'
);
