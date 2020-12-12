select count(*) from users;

select organizations.login, count(*) from comments
inner join users on users.id = comments."authorUserId"
inner join organizationteamsusers on organizationteamsusers."userId" = comments."authorUserId"
inner join organizations on organizationteamsusers."organizationId" = organizations.id
where users.username != 'k8s-ci-robot'
group by organizations.login
order by count(*) desc

select organizations.login, count(*) from docs
inner join users on users.id = docs."reporterUserId"
inner join organizationteamsusers on organizationteamsusers."userId" = docs."reporterUserId"
inner join organizations on organizationteamsusers."organizationId" = organizations.id
group by organizations.login
order by count(*) desc

select organizations.login, count(*) from docs
left join users on users.id = docs."assigneeUserId"
left join organizationteamsusers on organizationteamsusers."userId" = docs."assigneeUserId"
left join organizations on organizationteamsusers."organizationId" = organizations.id
group by organizations.login
order by count(*) desc


select * from docs where "docId"=89321

SELECT "docTypeId", count(*)
FROM docs
GROUP BY "docTypeId"




delete from docs where "organizationId" > 1;
delete from tags where "organizationId" > 1;
delete from docsourcelabels where "docSourceId" in (select id from docsources where "organizationId" > 1);

delete from organizationmilestones where "organizationId" > 1;
delete from docsourcemilestones where "docSourceId" in (select id from docsources where "organizationId" > 1);

select count(*) from tags
select *from docsourcemilestones