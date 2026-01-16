-- Marketing Gift Cards Table for Supabase (with multitenancy)
CREATE TABLE IF NOT EXISTS marketing_gift_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name text NOT NULL,
    code text NOT NULL,
    amount numeric NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_gift_cards_business_id ON marketing_gift_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_marketing_gift_cards_code ON marketing_gift_cards(code);

ALTER TABLE marketing_gift_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gift Cards are isolated by business" ON marketing_gift_cards
    USING (auth.uid() IS NOT NULL AND business_id = current_setting('request.jwt.claims', true)::json->>'business_id');
