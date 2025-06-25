--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-17 16:02:11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 25097)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 4858 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 25138)
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id integer NOT NULL,
    number text NOT NULL,
    "bankId" integer NOT NULL,
    "lastCheck" integer DEFAULT 1000 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25137)
-- Name: Account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Account_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Account_id_seq" OWNER TO postgres;

--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 224
-- Name: Account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Account_id_seq" OWNED BY public."Account".id;


--
-- TOC entry 223 (class 1259 OID 25128)
-- Name: Bank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Bank" (
    id integer NOT NULL,
    name text NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "routingNumber" text
);


ALTER TABLE public."Bank" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 25127)
-- Name: Bank_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Bank_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Bank_id_seq" OWNER TO postgres;

--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 222
-- Name: Bank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Bank_id_seq" OWNED BY public."Bank".id;


--
-- TOC entry 227 (class 1259 OID 25161)
-- Name: ChequeTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChequeTemplate" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "bankId" integer NOT NULL,
    background text NOT NULL,
    "fieldMap" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChequeTemplate" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25160)
-- Name: ChequeTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChequeTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChequeTemplate_id_seq" OWNER TO postgres;

--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 226
-- Name: ChequeTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChequeTemplate_id_seq" OWNED BY public."ChequeTemplate".id;


--
-- TOC entry 221 (class 1259 OID 25118)
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25117)
-- Name: Company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Company_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Company_id_seq" OWNER TO postgres;

--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 220
-- Name: Company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Company_id_seq" OWNED BY public."Company".id;


--
-- TOC entry 219 (class 1259 OID 25108)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 25107)
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 217 (class 1259 OID 25098)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4673 (class 2604 OID 25141)
-- Name: Account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account" ALTER COLUMN id SET DEFAULT nextval('public."Account_id_seq"'::regclass);


--
-- TOC entry 4671 (class 2604 OID 25131)
-- Name: Bank id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bank" ALTER COLUMN id SET DEFAULT nextval('public."Bank_id_seq"'::regclass);


--
-- TOC entry 4676 (class 2604 OID 25164)
-- Name: ChequeTemplate id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChequeTemplate" ALTER COLUMN id SET DEFAULT nextval('public."ChequeTemplate_id_seq"'::regclass);


--
-- TOC entry 4669 (class 2604 OID 25121)
-- Name: Company id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company" ALTER COLUMN id SET DEFAULT nextval('public."Company_id_seq"'::regclass);


--
-- TOC entry 4667 (class 2604 OID 25111)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 4850 (class 0 OID 25138)
-- Dependencies: 225
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, number, "bankId", "lastCheck", "createdAt", "updatedAt") FROM stdin;
5	5014493	5	1114	2025-06-12 18:24:36.324	2025-06-17 18:25:52.563
2	9864753307	2	6150	2025-06-09 15:56:25.429	2025-06-12 17:22:38.464
3	9838634997	3	1013	2025-06-12 17:13:49.58	2025-06-12 17:55:35.808
4	9853689827	4	1018	2025-06-12 18:13:16.496	2025-06-17 18:25:08.071
1	9891423205	1	10050	2025-06-05 16:49:07.49	2025-06-12 19:37:35.715
\.


--
-- TOC entry 4848 (class 0 OID 25128)
-- Dependencies: 223
-- Data for Name: Bank; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Bank" (id, name, "companyId", "createdAt", "updatedAt", "routingNumber") FROM stdin;
5	Alden	6	2025-06-12 18:23:00.865	2025-06-13 15:47:53.674	22309611
4	M&T	5	2025-06-12 18:12:35.391	2025-06-16 17:19:56.899	22000046
3	M&T	3	2025-06-12 17:11:15.63	2025-06-16 17:19:56.899	22000046
2	M&T	2	2025-06-09 15:55:30.173	2025-06-16 17:19:56.899	22000046
1	M&T	1	2025-06-05 16:21:20.117	2025-06-16 17:19:56.899	22000046
\.


--
-- TOC entry 4852 (class 0 OID 25161)
-- Dependencies: 227
-- Data for Name: ChequeTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChequeTemplate" (id, "companyId", "bankId", background, "fieldMap", "createdAt", "updatedAt") FROM stdin;
3	2	2	templates/blank_hawkDevelopment_mtb.pdf	{"micr": {"x": 115, "y": 553, "font": "micr", "width": 335, "height": 20, "fontSize": 20}, "eraseZones": [{"x": 130, "y": 555, "width": 300, "height": 25}, {"x": 550, "y": 765, "width": 50, "height": 20}, {"x": 530, "y": 510, "width": 50, "height": 20}, {"x": 517, "y": 26, "width": 100, "height": 70}], "chequeNumberTopRight": {"x": 550, "y": 765, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomMost": {"x": 515, "y": 14, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomRight": {"x": 535, "y": 515, "font": "helvetica", "fontSize": 10}}	2025-06-09 12:56:14.07	2025-06-09 12:56:14.07
2	1	1	templates/Sample Template - blank MYB 10021-10030.pdf	{"micr": {"x": 118, "y": 550, "font": "micr", "width": 360, "height": 28, "fontSize": 18}, "eraseZones": [{"x": 130, "y": 545, "width": 480, "height": 28}, {"x": 550, "y": 766, "width": 50, "height": 20}, {"x": 530, "y": 510, "width": 50, "height": 20}, {"x": 515, "y": 14, "width": 70, "height": 20}], "chequeNumberTopRight": {"x": 550, "y": 766, "font": "helvetica", "width": 50, "height": 20, "fontSize": 12}, "chequeNumberBottomMost": {"x": 515, "y": 14, "font": "helvetica", "width": 70, "height": 20, "fontSize": 12}, "chequeNumberBottomRight": {"x": 530, "y": 510, "font": "helvetica", "width": 70, "height": 20, "fontSize": 12}}	2025-06-09 12:56:14.07	2025-06-09 12:56:14.07
4	3	3	templates/blank_hawkProperties.pdf	{"micr": {"x": 115, "y": 553, "font": "micr", "width": 335, "height": 20, "fontSize": 20}, "eraseZones": [{"x": 130, "y": 555, "width": 300, "height": 25}, {"x": 550, "y": 765, "width": 50, "height": 20}, {"x": 530, "y": 510, "width": 50, "height": 20}, {"x": 517, "y": 26, "width": 100, "height": 70}], "chequeNumberTopRight": {"x": 550, "y": 765, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomMost": {"x": 515, "y": 14, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomRight": {"x": 535, "y": 515, "font": "helvetica", "fontSize": 10}}	2025-06-12 17:19:52.817	2025-06-12 17:19:52.817
5	5	4	templates/blank_wnyMuslims.pdf	{"micr": {"x": 115, "y": 553, "font": "micr", "width": 335, "height": 20, "fontSize": 20}, "eraseZones": [{"x": 130, "y": 555, "width": 300, "height": 25}, {"x": 550, "y": 765, "width": 50, "height": 20}, {"x": 530, "y": 510, "width": 50, "height": 20}, {"x": 517, "y": 26, "width": 100, "height": 70}], "chequeNumberTopRight": {"x": 550, "y": 765, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomMost": {"x": 515, "y": 14, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomRight": {"x": 535, "y": 515, "font": "helvetica", "fontSize": 10}}	2025-06-12 18:15:53.772	2025-06-12 18:15:53.772
6	6	5	templates/blank_waterfallProp.pdf	{"micr": {"x": 115, "y": 553, "font": "micr", "width": 335, "height": 20, "fontSize": 19}, "eraseZones": [{"x": 130, "y": 555, "width": 300, "height": 25}, {"x": 550, "y": 765, "width": 50, "height": 20}, {"x": 530, "y": 510, "width": 50, "height": 20}, {"x": 517, "y": 26, "width": 100, "height": 70}], "chequeNumberTopRight": {"x": 550, "y": 765, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomMost": {"x": 515, "y": 14, "font": "helvetica", "fontSize": 12}, "chequeNumberBottomRight": {"x": 535, "y": 515, "font": "helvetica", "fontSize": 10}}	2025-06-12 18:25:43.791	2025-06-12 18:25:43.791
\.


--
-- TOC entry 4846 (class 0 OID 25118)
-- Dependencies: 221
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, "createdAt", "updatedAt") FROM stdin;
1	MYB	2025-06-05 16:20:47.303	2025-06-05 16:21:59.527
3	Hawk Properties, LLC	2025-06-12 17:10:03.301	2025-06-12 17:09:42.503
2	Hawk Development, LLC	2025-06-09 15:54:56.43	2025-06-12 17:11:28.117
5	WNY Muslims	2025-06-12 18:09:07.179	2025-06-12 18:09:02.2
6	Waterfall Properties	2025-06-12 18:22:19.205	2025-06-12 18:22:34.271
\.


--
-- TOC entry 4844 (class 0 OID 25108)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role, "createdAt", "updatedAt", name) FROM stdin;
2	xyz@gmail.com	123456789	accountant	2025-06-16 13:45:46.462	2025-06-16 13:45:46.462	XYZ User
1	faizuddinM@myb-site.com	123456789	developer	2025-06-16 13:45:46.462	2025-06-16 17:51:55.766	Faizuddin M
\.


--
-- TOC entry 4842 (class 0 OID 25098)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
62a2d130-c428-4040-9a15-88634e8d6d4d	41e6904a287392c4b2b00a1375e933284f323f43bca817e727167d1c41bd8ee0	2025-06-05 12:20:16.344461-04	20250603160028_init	\N	\N	2025-06-05 12:20:16.305924-04	1
e0fc7ac8-5c8d-428d-9124-b30be975c1e7	5211dc5bf68d6c58ed2c3c6618e64875ba74bdaab5974c294a5f6debb1264a9b	2025-06-05 12:20:16.347537-04	20250603161531_add_timestamps	\N	\N	2025-06-05 12:20:16.34495-04	1
f3cd5404-6ef4-4736-8305-a192949187d2	11791fd69f7b3ea3830669f7d1df14c39641093cd5ae7e57b7199dc5d7b3792b	2025-06-05 12:20:16.359083-04	20250605152834_add_cheque_template	\N	\N	2025-06-05 12:20:16.34797-04	1
cd2e6113-0812-4568-b27c-c061e8dd1cc2	cfb8741ec1cf59a5ed5e060d8c88c526a2ed7d7ed8bb1cc5a3bee3ac9ac8b703	2025-06-09 12:56:14.0802-04	20250609165613_add_timestamps_to_cheque_template	\N	\N	2025-06-09 12:56:14.066401-04	1
058aca66-bc16-4ed7-a199-e42ff1b8e012	ea068cb1741f00064860cb0e537c6329f29d157536c48d8f465440a45853394e	2025-06-13 11:25:51.407257-04	20250613152549_make_routing_optional	\N	\N	2025-06-13 11:25:51.396078-04	1
bc38a770-7e19-4535-9595-fef0c7741a85	5037356253cbd5d54193a752bfdb4bad271b40a263da624019c4a18529a4d282	\N	20250613152843_add_routing_number_to_bank	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250613152843_add_routing_number_to_bank\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "routingNumber" of relation "Bank" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"routingNumber\\" of relation \\"Bank\\" contains null values", detail: None, hint: None, position: None, where_: Some("SQL statement \\"ALTER TABLE \\"Bank\\" ALTER COLUMN \\"routingNumber\\" SET NOT NULL\\"\\nPL/pgSQL function inline_code_block line 14 at SQL statement"), schema: Some("public"), table: Some("Bank"), column: Some("routingNumber"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6284), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250613152843_add_routing_number_to_bank"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250613152843_add_routing_number_to_bank"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:231	2025-06-13 11:43:34.402503-04	2025-06-13 11:33:10.34498-04	0
71e6eef5-b09b-44c1-8590-faac65e82eed	51e0648ca0aa789ac0fb4184fdb5915f42ff6136559caf1db74cedbf58430d4c	2025-06-13 11:43:34.413369-04	20250613152843_add_routing_number_to_bank		\N	2025-06-13 11:43:34.413369-04	0
0332de03-fcb0-4d85-b3ce-4b6095a3dd95	1ab4ded9c9a7363d5fd481cff7df26f2bba22cfda0325b3bfe238df81a435485	2025-06-16 13:45:46.466844-04	20250617000000_insert_specific_login_users	\N	\N	2025-06-16 13:45:46.458459-04	1
\.


--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 224
-- Name: Account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Account_id_seq"', 5, true);


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 222
-- Name: Bank_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Bank_id_seq"', 5, true);


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 226
-- Name: ChequeTemplate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChequeTemplate_id_seq"', 6, true);


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 220
-- Name: Company_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Company_id_seq"', 6, true);


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 2, true);


--
-- TOC entry 4689 (class 2606 OID 25147)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 25136)
-- Name: Bank Bank_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bank"
    ADD CONSTRAINT "Bank_pkey" PRIMARY KEY (id);


--
-- TOC entry 4692 (class 2606 OID 25168)
-- Name: ChequeTemplate ChequeTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChequeTemplate"
    ADD CONSTRAINT "ChequeTemplate_pkey" PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 25126)
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- TOC entry 4683 (class 2606 OID 25116)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4680 (class 2606 OID 25106)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4690 (class 1259 OID 25912)
-- Name: ChequeTemplate_bankId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChequeTemplate_bankId_key" ON public."ChequeTemplate" USING btree ("bankId");


--
-- TOC entry 4681 (class 1259 OID 25148)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4694 (class 2606 OID 25154)
-- Name: Account Account_bankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES public."Bank"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4693 (class 2606 OID 25149)
-- Name: Bank Bank_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bank"
    ADD CONSTRAINT "Bank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4695 (class 2606 OID 25174)
-- Name: ChequeTemplate ChequeTemplate_bankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChequeTemplate"
    ADD CONSTRAINT "ChequeTemplate_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES public."Bank"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4696 (class 2606 OID 25169)
-- Name: ChequeTemplate ChequeTemplate_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChequeTemplate"
    ADD CONSTRAINT "ChequeTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-06-17 16:02:11

--
-- PostgreSQL database dump complete
--

