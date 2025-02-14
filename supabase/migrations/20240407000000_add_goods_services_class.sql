-- Create a type for Nice classification entries
CREATE TYPE nice_classification AS (
    class_number integer,
    description text,
    goods text[],
    services text[]
);

-- Create table to store Nice classifications
CREATE TABLE IF NOT EXISTS nice_classifications (
    class_number integer PRIMARY KEY,
    description text NOT NULL,
    category text NOT NULL CHECK (category IN ('goods', 'services')),
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Create table for application class entries
CREATE TABLE IF NOT EXISTS application_classes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    class_number integer REFERENCES nice_classifications(class_number),
    goods text[] DEFAULT '{}',
    services text[] DEFAULT '{}',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    UNIQUE(application_id, class_number)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_application_classes_application_id 
ON application_classes(application_id);

CREATE INDEX IF NOT EXISTS idx_application_classes_class_number 
ON application_classes(class_number);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_application_classes_updated_at
    BEFORE UPDATE ON application_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert all Nice classifications
INSERT INTO nice_classifications (class_number, description, category) VALUES
(1, 'Chemicals for use in industry, science and photography, as well as in agriculture, horticulture and forestry; unprocessed artificial resins, unprocessed plastics; fire extinguishing and fire prevention compositions; tempering and soldering preparations; substances for tanning animal skins and hides; adhesives for use in industry; putties and other paste fillers; compost, manures, fertilizers; biological preparations for use in industry and science', 'goods'),
(2, 'Paints, varnishes, lacquers; preservatives against rust and against deterioration of wood; colorants, dyes; inks for printing, marking and engraving; raw natural resins; metals in foil and powder form for use in painting, decorating, printing and art', 'goods'),
(3, 'Non-medicated cosmetics and toiletry preparations; non-medicated dentifrices; perfumery, essential oils; bleaching preparations and other substances for laundry use; cleaning, polishing, scouring and abrasive preparations', 'goods'),
(4, 'Industrial oils and greases, wax; lubricants; dust absorbing, wetting and binding compositions; fuels and illuminants; candles and wicks for lighting', 'goods'),
(5, 'Pharmaceuticals, medical and veterinary preparations; sanitary preparations for medical purposes; dietetic food and substances adapted for medical or veterinary use, food for babies; dietary supplements for human beings and animals; plasters, materials for dressings; material for stopping teeth, dental wax; disinfectants; preparations for destroying vermin; fungicides, herbicides', 'goods'),
(6, 'Common metals and their alloys, ores; metal materials for building and construction; transportable buildings of metal; non-electric cables and wires of common metal; small items of metal hardware; metal containers for storage or transport; safes', 'goods'),
(7, 'Machines, machine tools, power-operated tools; motors and engines (except for land vehicles); machine coupling and transmission components (except for land vehicles); agricultural implements, other than hand-operated hand tools; incubators for eggs; automatic vending machines', 'goods'),
(8, 'Hand tools and implements, hand-operated; cutlery; side arms, except firearms; razors', 'goods'),
(9, 'Scientific, research, navigation, surveying, photographic, cinematographic, audiovisual, optical, weighing, measuring, signalling, detecting, testing, inspecting, life-saving and teaching apparatus and instruments; apparatus and instruments for conducting, switching, transforming, accumulating, regulating or controlling the distribution or use of electricity; apparatus and instruments for recording, transmitting, reproducing or processing sound, images or data; recorded and downloadable media, computer software, blank digital or analogue recording and storage media; mechanisms for coin-operated apparatus; cash registers, calculating devices; computers and computer peripheral devices; diving suits, divers masks, ear plugs for divers, nose clips for divers and swimmers, gloves for divers, breathing apparatus for underwater swimming; fire-extinguishing apparatus', 'goods'),
(10, 'Surgical, medical, dental and veterinary apparatus and instruments; artificial limbs, eyes and teeth; orthopaedic articles; suture materials; therapeutic and assistive devices adapted for persons with disabilities; massage apparatus; apparatus, devices and articles for nursing infants; sexual activity apparatus, devices and articles', 'goods'),
(11, 'Apparatus and installations for lighting, heating, cooling, steam generating, cooking, drying, ventilating, water supply and sanitary purposes', 'goods'),
(12, 'Vehicles; apparatus for locomotion by land, air or water', 'goods'),
(13, 'Firearms; ammunition and projectiles; explosives; fireworks', 'goods'),
(14, 'Precious metals and their alloys; jewellery, precious and semi-precious stones; horological and chronometric instruments', 'goods'),
(15, 'Musical instruments; music stands and stands for musical instruments; conductors batons', 'goods'),
(16, 'Paper and cardboard; printed matter; bookbinding material; photographs; stationery and office requisites, except furniture; adhesives for stationery or household purposes; drawing materials and materials for artists; paintbrushes; instructional and teaching materials; plastic sheets, films and bags for wrapping and packaging; printers type, printing blocks', 'goods'),
(17, 'Unprocessed and semi-processed rubber, gutta-percha, gum, asbestos, mica and substitutes for all these materials; plastics and resins in extruded form for use in manufacture; packing, stopping and insulating materials; flexible pipes, tubes and hoses, not of metal', 'goods'),
(18, 'Leather and imitations of leather; animal skins and hides; luggage and carrying bags; umbrellas and parasols; walking sticks; whips, harness and saddlery; collars, leashes and clothing for animals', 'goods'),
(19, 'Materials, not of metal, for building and construction; rigid pipes, not of metal, for building; asphalt, pitch, tar and bitumen; transportable buildings, not of metal; monuments, not of metal', 'goods'),
(20, 'Furniture, mirrors, picture frames; containers, not of metal, for storage or transport; unworked or semi-worked bone, horn, whalebone or mother-of-pearl; shells; meerschaum; yellow amber', 'goods'),
(21, 'Household or kitchen utensils and containers; cookware and tableware, except forks, knives and spoons; combs and sponges; brushes, except paintbrushes; brush-making materials; articles for cleaning purposes; unworked or semi-worked glass, except building glass; glassware, porcelain and earthenware', 'goods'),
(22, 'Ropes and string; nets; tents and tarpaulins; awnings of textile or synthetic materials; sails; sacks for the transport and storage of materials in bulk; padding, cushioning and stuffing materials, except of paper, cardboard, rubber or plastics; raw fibrous textile materials and substitutes therefor', 'goods'),
(23, 'Yarns and threads for textile use', 'goods'),
(24, 'Textiles and substitutes for textiles; household linen; curtains of textile or plastic', 'goods'),
(25, 'Clothing, footwear, headwear', 'goods'),
(26, 'Lace, braid and embroidery, and haberdashery ribbons and bows; buttons, hooks and eyes, pins and needles; artificial flowers; hair decorations; false hair', 'goods'),
(27, 'Carpets, rugs, mats and matting, linoleum and other materials for covering existing floors; wall hangings, not of textile', 'goods'),
(28, 'Games, toys and playthings; video game apparatus; gymnastic and sporting articles; decorations for Christmas trees', 'goods'),
(29, 'Meat, fish, poultry and game; meat extracts; preserved, frozen, dried and cooked fruits and vegetables; jellies, jams, compotes; eggs; milk, cheese, butter, yogurt and other milk products; oils and fats for food', 'goods'),
(30, 'Coffee, tea, cocoa and substitutes therefor; rice, pasta and noodles; tapioca and sago; flour and preparations made from cereals; bread, pastries and confectionery; chocolate; ice cream, sorbets and other edible ices; sugar, honey, treacle; yeast, baking-powder; salt, seasonings, spices, preserved herbs; vinegar, sauces and other condiments; ice (frozen water)', 'goods'),
(31, 'Raw and unprocessed agricultural, aquacultural, horticultural and forestry products; raw and unprocessed grains and seeds; fresh fruits and vegetables, fresh herbs; natural plants and flowers; bulbs, seedlings and seeds for planting; live animals; foodstuffs and beverages for animals; malt', 'goods'),
(32, 'Beers; non-alcoholic beverages; mineral and aerated waters; fruit beverages and fruit juices; syrups and other non-alcoholic preparations for making beverages', 'goods'),
(33, 'Alcoholic beverages, except beers; alcoholic preparations for making beverages', 'goods'),
(34, 'Tobacco and tobacco substitutes; cigarettes and cigars; electronic cigarettes and oral vaporizers for smokers; smokers articles; matches', 'goods'),
(35, 'Advertising; business management, organization and administration; office functions', 'services'),
(36, 'Financial, monetary and banking services; insurance services; real estate affairs', 'services'),
(37, 'Construction services; installation and repair services; mining extraction, oil and gas drilling', 'services'),
(38, 'Telecommunications services', 'services'),
(39, 'Transport; packaging and storage of goods; travel arrangement', 'services'),
(40, 'Treatment of materials; recycling of waste and trash; air purification and treatment of water; printing services; food and drink preservation', 'services'),
(41, 'Education; providing of training; entertainment; sporting and cultural activities', 'services'),
(42, 'Scientific and technological services and research and design relating thereto; industrial analysis, industrial research and industrial design services; quality control and authentication services; design and development of computer hardware and software', 'services'),
(43, 'Services for providing food and drink; temporary accommodation', 'services'),
(44, 'Medical services; veterinary services; hygienic and beauty care for human beings or animals; agriculture, aquaculture, horticulture and forestry services', 'services'),
(45, 'Legal services; security services for the physical protection of tangible property and individuals; personal and social services rendered by others to meet the needs of individuals', 'services')
ON CONFLICT (class_number) DO UPDATE 
SET description = EXCLUDED.description,
    category = EXCLUDED.category;

-- Add RLS policies
ALTER TABLE nice_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_classes ENABLE ROW LEVEL SECURITY;

-- Everyone can view nice classifications
CREATE POLICY "Nice classifications are viewable by everyone"
    ON nice_classifications FOR SELECT
    USING (true);

-- Users can view their own application classes
CREATE POLICY "Users can view their own application classes"
    ON application_classes FOR SELECT
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

-- Users can insert their own application classes
CREATE POLICY "Users can insert their own application classes"
    ON application_classes FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

-- Users can update their own application classes
CREATE POLICY "Users can update their own application classes"
    ON application_classes FOR UPDATE
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

-- Users can delete their own application classes
CREATE POLICY "Users can delete their own application classes"
    ON application_classes FOR DELETE
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    )); 