exports.getProjectStatus = (site) => {
  if (!site) return 'NOT_ASSIGNED';

  const today = new Date();

  if (site.completedWork === 0) return 'NOT_STARTED';

  if (site.completedWork < site.totalWork) {
    if (site.deadline && today > site.deadline) {
      return 'DELAYED';
    }
    return 'IN_PROGRESS';
  }

  if (site.completedWork >= site.totalWork) {
    return 'COMPLETED';
  }
};
